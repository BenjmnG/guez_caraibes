let body      = document.querySelector('body'),
    main      = document.querySelector('main'),
    url       = window.location.href,
    tX        = 0,
    tY        = 0,
    initR     = 2,
    r         = initR



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

  validMinr: () => {
    if(r < initR){
      r = initR
    } else if(r <= initR + 2 ){
      _map.svg.el.classList = `no-scale`
    } else if(r > initR + 6){
      _map.svg.el.classList = `scale-B`
    } else if(r > initR + 2 ){
      _map.svg.el.classList = `scale-A`
    }
  },

  validMaxt: () => {
    if(tX > 0){ tX = 0 }

    let max = _map.section.height * (1 -  r)

    if(tY < max ){ tY = max }
  },

  getPerfectRatio: (id = null) => {
    let baseIsland = 13
    if(id == 'l-Martinique'){
      baseIsland = 13
    } else if (id == 'l-Guadeloupe'){
      baseIsland = 25
    } else if (id == 'l-Saint-Martin'){
      baseIsland = 3
    } else {
      baseIsland = 13
    }

    r = _map.section.width  / (baseIsland * 5)

    map().validMinr()

  },

  getCoord: (el) => {

    if(typeof el == 'string'){
      let id  = document.getElementById(el)
      let x = id.getAttribute('data-x')
      let y = id.getAttribute('data-y')

      return [x, y]
    }
  },

  setTransform: () => {
    _map.svg.el.style.setProperty('--tX', `${tX}px`);
    _map.svg.el.style.setProperty('--tY', `${tY}px`);
    _map.svg.el.style.setProperty('--r', r);
  },

  setFocusPoint: (x, y) => {


    let pt_radius = 1 / 2;

    // Deform Ratio is the relation between SVG viewbox and container (1.5/1 on 1080 pixel screen)
    let deformRatio = _map.section.width / _map.svg.viewbox

    let centerWidth   = _map.section.width  / 2 
        centerHeight  = _map.section.height / 2

    // Ratio Increase by de
    let factor = r * deformRatio * -1

    tX = (x - pt_radius) * (-r * deformRatio) + centerWidth;
    tY = (y - pt_radius) * (-r * deformRatio) + centerHeight;

    map().validMaxt()
    map().setTransform();


  },


  init: () => {

    //
    // UI Project List
    document.querySelectorAll('.list.projets [data-map-point]').forEach(el => {
      let id_to_target     = el.getAttribute('data-map-point')
      let island_to_target = el.getAttribute('data-island')

      //Temp
      map().getPerfectRatio('l-Martinique')
      map().setFocusPoint(208, 156)

      el.addEventListener("mouseenter", () => { 
        map().getPerfectRatio(island_to_target)
        map().setTransform()
        
        let coord = map().getCoord(id_to_target)
        map().setFocusPoint(coord[0], coord[1])
      })
    })

    const setVueMode = (single, id) => {
      main.setAttribute('data-vue', single == true ?  'single' : 'list')

      document.querySelector(`.list.projets [data-map-point="${id}"]`)
        .setAttribute('data-active', single == true ? true : false)
    }

    document.querySelectorAll('.etiquette').forEach(el => {
      el.addEventListener("click", () => {

        let alreadyActive = document.querySelector(`.list.projets [data-active="true"]`)
        if(alreadyActive && alreadyActive.getAttribute('data-map-point') == el.id){
          // Project is already in Single Mode. Time to shut it down
          setVueMode(false, el.id)
        } else if(alreadyActive) {
          // A project is already open and there is a new project to see
          alreadyActive.setAttribute('data-active', false)
          setVueMode(true, el.id)
        } else {
          // No project is open and there is a project to see
          setVueMode(true, el.id)
        }
        
      })
    })

    document.querySelector('#filter > button')
      .addEventListener("click", () => {
        let id = document.querySelector('[data-active="true"]')
          .getAttribute('data-map-point')
        setVueMode(false, id)
      } )

    //
    // UI Map 

    // setInteractionAbilities
    // https://codepen.io/stack-getover/pen/VwPgQQr
    let start = { x: 0, y: 0 }
    let panning = false
    let cursor = document.querySelector('#cursor')

    //_map.section.el.addEventListener("mouseover", function(e) {})

    _map.section.el.addEventListener("mousedown", function(e) {
      start = { x: e.clientX, y: e.clientY };
      panning = true
      project().closeInit()
    })

    _map.section.el.addEventListener("mousemove", function(e) {
      if (panning === true) {

        tX = tX + (e.clientX - start.x) //  * ratio - 1;
        tY = tY + (e.clientY - start.y) //  * ratio - 1;

        map().validMaxt()

        _map.svg.el.style.setProperty('--tX', `${tX}px`);
        _map.svg.el.style.setProperty('--tY', `${tY}px`);

        start.x = e.clientX 
        start.y = e.clientY
        
      }
    })
            
    _map.section.el.addEventListener("mouseup", function(e) {
      panning = false
    });


    _map.section.el.addEventListener("wheel", function(e) {
      e.preventDefault();
      e.stopPropagation();

      project().closeInit()

      var   xs    = (e.clientX - tX) / r,
            ys    = (e.clientY - tY) / r,
            delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
      (delta > 0) ? (r *= 1.2) : (r /= 1.2);
      
      map().validMinr()

      let originCenter = _map.svg.viewbox / 2 
      tX = (e.clientX - xs * r);
      tY = (e.clientY - ys * r);

      map().validMaxt()

      map().setTransform();      
    })

  }
})

//
// Event Listener
//


const event = () => ({

  index: () => {

  },

  project: () => {
    
    window._map = {

      section: {
        el:     document.querySelector("#map"),
        width:  document.querySelector("#map").getBoundingClientRect().width,
        height: document.querySelector("#map").getBoundingClientRect().height
      },

      on: 'l-Martinique',
      
      svg: {
        el: document.querySelector("#main_map"),
        viewbox: 595
      } 
    }

    map().init()

    // Openers are three hidden input to open three list of item filter
    let openers = document.querySelectorAll('[name="open_filter"]')
    let items = document.querySelectorAll('[name^="f-"]')

    // This function remove init class on main
    // Three openers can triggers it.
    // Once called, we destroy the two other triggers.
    const removeInit = () => {
      if(main.classList.contains('init')){
        main.classList.remove('init')
        openers.forEach( opener => {
          opener.removeEventListener("change", removeInit, true)
          _map.section.el.removeEventListener("change", removeInit, true)
        })
        items.forEach( item => {
          item.removeEventListener("change", removeInit, true)
        })
      }
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
      _map.section.el.addEventListener('click', removeInit, {once: true})
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

