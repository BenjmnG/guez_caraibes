let body      = document.querySelector('body'),
    main      = document.querySelector('main'),
    url       = window.location.href,
    main_map  = document.querySelector("#main_map"),
    map_on    = 'pt-Guadeloupe' // Guadeloupe as first reference point for focus map
    ;

const isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`) === true || window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;



//
// Function
//

function obf(){
  let as = document.querySelectorAll(".obf")
  as.forEach( a => {
    let value = a.getAttribute('data-href'),
        protocol = a.getAttribute('data-protocol')

    if(protocol == "mail"){protocol = "mailto:"}
    else if(protocol == "phone"){protocol = "tel:"}
      
    value = value.split("").reverse().join("");
    a.setAttribute("href", protocol + value)


    //if(!a.classList.contains('humanize')){
      a.innerHTML = value // else let inner as it is
    //}

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


const map = () => ({

  init: () => {

    document.querySelectorAll('#map .list_container button').forEach(el => {
      let target = el.getAttribute("data-target")
      el.addEventListener("mouseover", () => { map().focus(target)})
    })

    map().setZoomAbilities()

  },

  getPerfectRatio: (id = 'l-Guadeloupe') => {
    let baseIsland = document.querySelector(`#${id}`).getBoundingClientRect().width,
          baseWidth = window.innerWidth

    return baseWidth / (baseIsland * 8)
  },

  setZoomLevel: (state = 'A') => {

    setTimeout(() => {
      main_map.style.setProperty('--r', map().getPerfectRatio())
      main_map.classList =`scale-${state} transition`
      map().focus();
      setTimeout(() => {
        main_map.classList.remove('transition') 
      }, 1000)
    }, 250)
  },

  setZoomAbilities: () => {
    document.addEventListener("wheel", function(e) {  
      let ratio = getComputedStyle(main_map).getPropertyValue('--r'),
          computedRatio = ratio
      
      if(e.deltaY < 0){
          computedRatio = parseFloat(ratio) * 1.25
      } else {    
          computedRatio = parseFloat(ratio) * .75
      }

      if(computedRatio < 1){ computedRatio = 1}
      
      main_map.style.setProperty(`--r`, computedRatio)
      map().focus()
    });
  },

  focus: (id) => {

    map_on = id !== undefined && id ? id : 'pt-Basse_Terre'

    map().setZoomLevel('A')
      
    let el = document.querySelector(`#${map_on}`)

    console.log(el)

    let viewBox = main_map.getAttribute('viewBox').split(/\s+|,/)

                
    let ratio = getComputedStyle(main_map).getPropertyValue('--r')

    // Coordonnée du point central du svg
    let cX = parseInt(viewBox[2] / 2 )
    let cY = parseInt(viewBox[3] / 2 )

    // Coordonée de l'élément à montrer
    let _cX = (el.getAttribute('data-x'))
    let _cY = (el.getAttribute('data-y'))

    main_map.style.setProperty('--tX', `${(cX - _cX) * ratio - 1}px`);
    main_map.style.setProperty('--tY', `${(cY - _cY) * ratio - 1}px`);

    console.log({cX, cY, _cX, _cY, ratio})

  }
})

//
// Event Listener
//


const event = () => ({

  index: () => {

  },

  project: () => {
    //map().init()

    // Openers are three hidden input to open three list of item filter
    let openers = document.querySelectorAll('[name="open_filter"]')

    // This function remove init class on main
    // Three openers can triggers it.
    // Once called, we destroy the two other triggers.
    const removeInit = () => {
      main.classList.remove('init')
      openers.forEach( opener => {
        opener.removeEventListener("change", removeInit, true)
      })
    }

    // This function uncheck Openers
    const checkboxAsRadio = (justChanged) => {

      // If we're a large screen
      if(window.innerWidth >= 900 ){

        // If Current input is checked
        if(justChanged.checked == true){

          // If initial Vue
          if(main.classList.contains('init')){

            // So uncheck All
            openers.forEach( opener => opener.checked = false )

          } else {

            // If an Input was previously checked, Uncheck all
            let alreadyChecked = false
            openers.forEach(o => {
              if(o.id != justChanged.id && o.checked == true){
                alreadyChecked = true

              }
            })
            
            if(alreadyChecked){
              openers.forEach( opener => {
                opener.checked = false
              } )
            }

          }
        } else {
          openers.forEach( opener => opener.checked = false )
        }

      // If we're a small screen
      } else {

         //If Current input is checked
         if(justChanged.checked == true){ 

          // Uncheck all Openers but Current 
          openers.forEach( opener => {
            if(opener.id != justChanged.id){
              opener.checked = false
            }
          })
        }
      }
    }

    openers.forEach( opener => {
      opener.addEventListener('change', evt => checkboxAsRadio(evt.target))
      opener.addEventListener('change', removeInit, {once: true})


    })

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

