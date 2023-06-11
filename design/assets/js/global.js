let body      = document.querySelector('body'),
    main      = document.querySelector('main'),
    url       = window.location.href



const isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`) === true || window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;


//
// Tools
//

function mapNumber(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

function obf(){
  let as = document.querySelectorAll(".obf")
  as.forEach( a => {
    let value     = a.getAttribute('data-href'),
        protocol  = a.getAttribute('data-protocol'),
        subject   = a.getAttribute('data-subject') ? `?subject=${a.getAttribute('data-subject')}` : null

    if(protocol == "mail"){protocol = "mailto:"}
    else if(protocol == "phone"){protocol = "tel:"}
      
    value = value.split("").reverse().join("");
    a.setAttribute("href", protocol + value + subject)


    if(a.innerHTML.length == 0){
      a.innerHTML = value 
    }

    a.removeAttribute('data-href')
    a.removeAttribute('data-protocol')
    a.classList.remove('obf')

  })
}

function isDarkMode(){
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {  
    body.classList.add("darkMode");
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      if(event.matches){
        body.classList.add("darkMode")
      } else {
        body.classList.remove("darkMode")
      }
  });
}


//
// Event Listener
//


const event = () => ({

  index: () => {

  },

  
  project: () => {

    if (/Android|iPhone/i.test(navigator.userAgent)) {
      document.querySelector('[name="open_filter"]:checked').checked = false
    }
    // JS for this page is verbose. 
    // Calling  function in a spécéfic project.js file
    project_list().onLoad()
    project_map().onLoad()
  },

  equipes: () => {
    
  },

  sf: () => {
    let items = document.querySelectorAll('.list.savoir-faire li')
    items.forEach( item => {

      item.classList.add('close', 'init')

      item.querySelector('h2').addEventListener('click', () => {
        if( item.classList != "open") {
          let is_any_close = document.querySelector('.list.savoir-faire li.open')
          is_any_close !== null ? is_any_close.classList = 'close' : null
          item.classList = "open"
        } else {
          item.classList = "close"
        }
      })
    })
  }
})

//
// On init
//

obf()

// That's all for me. Thank you !
// console.log("%cDesign + Code: \nhttps://bnjm.eu", "font-family: monospace; font-size: 1.5em;")

