let body      = document.querySelector('body'),
    main      = document.querySelector('main'),
    url       = window.location.href,
    sect_map  = document.querySelector("#map"),
    main_map  = document.querySelector("#main_map"),
    map_on    = 'l-Martinique', // Guadeloupe as first reference point for focus map
    tX        = 0,
    tY        = 0,
    r         = 1.25,
    svgG      = document.querySelector('#main_map > g'),
    sectMapSize,
    svgSquareSize = 595

const isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`) === true || window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;



//
// Function
//

function mapNumber(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

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


const project = () => ({
  closeInit: () => {
    if(main.classList.contains('init')){
      main.classList.remove('init')
      if(document.querySelector('input[name="open_filter"]:checked')){
        document.querySelector('input[name="open_filter"]:checked').checked = false
      }
    }
  }
})

const map = () => ({

  init: () => {

    document.querySelectorAll('.list.projets [data-map-point]').forEach(el => {
      let id_to_target = el.getAttribute('data-map-point')
      el.addEventListener("mouseenter", () => { 
        map().setZoomLevel('A')
        map().focus(id_to_target)
      })
    })

    map().setZoomAbilities()
    map().setDragAbilities()

  },

  getPerfectRatio: (id = 'l-Martinique') => {
    let baseIsland = document.querySelector(`#${id}`).getBoundingClientRect().width,
          baseWidth = window.innerWidth

    r = baseWidth / (baseIsland * 8)

    return r
  },

  checkMaxt: () => {
      let max = 296
      if(tX > max * r)      { tX = max  * r }
      else if(tX < -max * r){ tX = -max * r }
      else if(tY > max * r) { tY = max  * r }
      else if(tY < -max * r){ tY = -max * r }
    },

  setZoomLevel: (state = 'A', id) => {
      if(!main_map.classList.contains(`scale-${state}`)){
        main_map.style.setProperty('--r', map().getPerfectRatio())
        main_map.classList =`scale-${state}`
      }
  },

  setTransform: () => {
    svgG.style.transform = "translate(" + tX + "px, " + tY + "px) scale(" + r + ")";
  }

  updateCursor: (x, y) => {
    let cursor = document.querySelector('#cursor')

    // Update container size if resize
    sectMapSize = sect_map.getBoundingClientRect().height

    x-= sect_map.getBoundingClientRect().left
    y-= sect_map.getBoundingClientRect().top

    let _px = mapNumber(x, 0, sectMapSize, 0, 1 )
    let _py = mapNumber(y, 0, sectMapSize, 0, 1 )
     
    cursor.setAttribute('cx', _px * svgSquareSize )
    cursor.setAttribute('cy', _py * svgSquareSize )

    return [_px, _py]
  },



  setDragAbilities: () => {
    let mouseInX, mouseInY
    let isMoving = false
    let cursor = document.querySelector('#cursor')

    sect_map.addEventListener("mouseover", function(e) {
      //map().updateCursor(e.clientX, e.clientY)
    })
    sect_map.addEventListener("mousedown", function(e) {
      mouseStartX = e.clientX
      mouseStartY = e.clientY
      isMoving = true

      project().closeInit()

      
      map().focus(map().updateCursor(e.clientX, e.clientY))
    })

    sect_map.addEventListener("mousemove", function(e) {
      if (isMoving === true) {
        let  mouseEndX = e.clientX,
             mouseEndY = e.clientY

        tX = tX + (mouseEndX - mouseStartX) //  * ratio - 1;
        tY = tY + (mouseEndY - mouseStartY) //  * ratio - 1;

        map().checkMaxt()

        main_map.style.setProperty('--tX', `${tX}px`);
        main_map.style.setProperty('--tY', `${tY}px`);

        mouseStartX = e.clientX 
        mouseStartY = e.clientY

        //map().updateCursor(e.clientX, e.clientY)
        
      }
    })
            
    sect_map.addEventListener("mouseup", function(e) {
      isMoving = false
    });
  },

  setZoomAbilities: () => {
    sect_map.addEventListener("wheel", function(e) {  
        e.preventDefault();
        e.stopPropagation();

      project().closeInit()

      r = e.deltaY < 0 ? r * 1.25 : Math.max(r * .75, 1.25)
      
      r = Math.round(r)

      main_map.style.setProperty(`--r`, r)
      map().focus(map().updateCursor(e.clientX, e.clientY))
    });
  },

  focus: (el = 'l-Martinique') => {
      
    let viewBox = main_map.getAttribute('viewBox').split(/\s+|,/)
                
    // Coordonnée du point central du svg
    let cX = parseInt(viewBox[2] / 2 )
    let cY = parseInt(viewBox[3] / 2 )

    // Coordonée de l'élément à montrer
    if(typeof el == 'string'){
      let id  = document.getElementById(el)
      let _cX = id.getAttribute('data-x')
      let _cY = id.getAttribute('data-y')
  
      let pt_radius = 1 / 2;

      tX = (cX - _cX + pt_radius) * r - 1;
      tY = (cY - _cY + pt_radius) * r - 1;
  
      main_map.style.setProperty('--tX', `${tX}px`);
      main_map.style.setProperty('--tY', `${tY}px`);


      map().setTransform()

    } else {
      let deformRatio =  svgSquareSize / sectMapSize,
          vue,
          offset = (svgSquareSize * r - svgSquareSize) / 2
      console.log(offset, deformRatio)


    }

    //map().checkMaxt()


  }
})

//
// Event Listener
//


const event = () => ({

  index: () => {

  },

  project: () => {
    map().init()

    // Openers are three hidden input to open three list of item filter
    let openers = document.querySelectorAll('[name="open_filter"]')
    let items = document.querySelectorAll('[name^="f-"]')

    // This function remove init class on main
    // Three openers can triggers it.
    // Once called, we destroy the two other triggers.
    const removeInit = () => {
      main.classList.remove('init')
      openers.forEach( opener => {
        opener.removeEventListener("change", removeInit, true)
        sect_map.removeEventListener("change", removeInit, true)
      })
      items.forEach( item => {
        item.removeEventListener("change", removeInit, true)
      })
    }

    const updateOpenersValues = (categorie) => {

      let similarInputs = document.querySelectorAll(`[name="${categorie}"]:checked`),
          checkedValues = []

      similarInputs.forEach(i => {
        checkedValues.push(i.getAttribute("value"))
      })

      document.querySelector(`label[for="filter_by_${categorie.substring(2)}"] .value`).innerHTML = checkedValues.join(', ')
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


    //
    // on Init
    //

    // From Savoir-faire
    let params = (new URL(document.location)).searchParams;
    let name = params.get('sf');
    if (name){
      let input = document.querySelector(`[name="f-sf"][value="${name}"]`)
      input.checked = true;
    }

    openers.forEach( opener => {
      opener.addEventListener('change', evt => checkboxAsRadio(evt.target))
      opener.addEventListener('change', removeInit, {once: true})

      // Update value on opener when possible start checked items
      let categorie = 'f-' + opener.id.slice(-2)
      updateOpenersValues(categorie)
    })

    items.forEach( item => {
      item.addEventListener('change', evt => {
        let categorie = (evt.target).getAttribute('name')
        updateOpenersValues(categorie)
      })
      item.addEventListener('change', removeInit, {once: true})
    })

    if(main.classList.contains('init')){
      sect_map.addEventListener('click', removeInit, {once: true})
    }


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

