'use strict';

const t = 100;
let initiated = false,
    currentURL = window.location.pathname;

/**
 * Search for a parent anchor tag outside a clicked event target
 *
 * @param {HTMLElement} el the clicked event target.
 * @param {number} maxNests max number of levels to go up.
 * @returns the anchor tag or null
 */
function findAnchorTag(el, maxNests = 3) {
  for (let i = maxNests; el && i > 0; --i, el = el.parentNode) {
    if (el.nodeName === 'A') {
      return el;
    }
  }
  return null;
}

/**
 * Perform action, specific to this project based on context
 * @param {XML request}   d           The XML request
 * @param {HTML element}  dBody       Body of served element
 * @param {string}        dataServe   Context of served element
 */  
function callFunctionBasedOnContext(d, dBody, dataServe, dataPrev){
  
  allPagesEvent()
  // Specific to served Index
  if(dataServe == 'index'){
    indexPageEvent()
  } else {
    allPagesButIndexEvent()
  }
}

(function () {
  
  /**
   * Load content into page without a whole page reload
   * @param {string} href URL to route to
   * @param {boolean} pushState whether to call history.pushState or not
   */
  function load(href, pushState) {
    const container = $('main');
    const xhr = new XMLHttpRequest();

    xhr.onload = function () {

        // d elements refers to new loaded elements
        const d = xhr.responseXML,
              dTitle = d.title || '',
              dContainer = $('main:not(.previous)', d),
              dBody = $('body', d);


        // Reset Scroll position
        window.scrollTo(0,0)

        // Prevent concurrently transition by stopping the new one
        if(initiated){
          console.log('A transition is already on going. Wait a second')
          return
        }

        // initiat
        initiated = true;
        
        // Add body a class during folling action
        body.classList.add('transition')

        //  Get context for Previous and newly Serve content
        let dataServe = dContainer.getAttribute('data-type'),
            dataPrev = container.getAttribute('data-type');

        // Update Body attribute
        body.setAttribute('data-serve', dataServe)
        body.setAttribute('data-prev', dataPrev)
        
        // Add transitional class to deprecated content
        container.classList = 'previous';


        // Promise previous should be removed 
        new Promise((resolve, reject) => {

          // Declare mutation observer
          const x = new MutationObserver(function (e) {
            if (e[0].removedNodes) resolve("Previous is removed");
          });

          // Set mutation observer
          x.observe(document.querySelector('body'), { childList: true });

          setTimeout( function() {
            let m = document.querySelector('main.previous')
            // Prevent Ghost
            m.hidden = true
            // Ad midway animation clear Previous content
            m.remove();

          }, t / 2)
        })
        .then( msg => {
          // Promise new should be added 
          return new Promise((resolve, reject) => {
            // Declare mutation observer
            const y = new MutationObserver(function (e) {
              if (e[0].addedNodes) resolve("New is add");
            });

            // Set mutation observer
            y.observe(document.querySelector('body'), { childList: true });

            // Insert new content in place of deprecated Main element
            document.querySelector('#panorama').insertAdjacentHTML(
              'afterend',
              (dContainer && dContainer.outerHTML) || '');
          })
        })
        .then(msg => {
          // Change document title
          document.title = dTitle;

          // Slightly change page color
          jumpHue(40)

          // update history
          if (pushState) {
            history.pushState({}, dTitle, href);
          }
          
          // Call function based on context
          callFunctionBasedOnContext(d, dBody, dataServe, dataPrev)  
        })
        .then(msg => {
          // Thats all for me tonight. Thank you all !
          initiated = false;
          setTimeout( function() {
            body.classList.remove('transition')
          }, t )
        })

    };
    xhr.onerror = function () {
      // fallback to normal link behaviour
      document.location.href = href;
      return;
    };
    xhr.open('GET', href);
    xhr.responseType = 'document';
    xhr.send();
  }

  function $(sel, con) {
    return (con || document).querySelector(sel);
  }

  window.addEventListener('click', function (evt) {
    let baseUrl = $('meta[name="x-base-url"]')?.getAttribute('content') || '/';
    const el = findAnchorTag(evt.target);
    const href = el?.getAttribute('href');
    if (el && href) {
      if (
        href.startsWith('#') ||
        el.getAttribute('target') === '_blank' ||
        /\.\w+$/.test(href)
      ) {
        // eleventy urls in this configuration do not have extensions like .html
        // if they have, or if target _blank is set, or they are a hash link,
        // then do nothing.
        return;
      }
      // if the URL starts with the base url, do the SPA handling
      else if (href.startsWith(baseUrl)) {
        evt.preventDefault();
        load(href, true);
      }
    }
  });

  window.addEventListener('popstate', function (e) {
    // Prevent Reload on ahnchor link
    if ( window.location.pathname != currentURL ) {
      load(document.location.pathname, false);
    }
    currentURL = window.location.pathname
  });
})();