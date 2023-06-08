// Openers are three hidden input to open three list of item filter
let openers = document.querySelectorAll('[name="open_filter"]')
let items   = document.querySelectorAll('[name^="f-"]')

let _map = {

  section: {
    el:     document.querySelector("#map"),
    width:  document.querySelector("#map").getBoundingClientRect().width,
    height: document.querySelector("#map").getBoundingClientRect().height
  },

  on: 'l-Martinique',
  
  svg: {
    el: document.querySelector("#main_map"),
    viewbox: 495
  } 
}



const project_list = () => ({

  // This function remove init class on main
  // Three openers can triggers it.
  // Once called, we destroy the two other triggers.
  removeInit: () => {
    if(main.classList.contains('init')){
      main.classList.remove('init')
      openers.forEach( opener => {
        opener.removeEventListener("change", project_list().removeInit, true)
        _map.section.el.removeEventListener("change", project_list().removeInit, true)
      })
      items.forEach( item => {
        item.removeEventListener("change", project_list().removeInit, true)
      })
    }
  },

  // From Savoir-faire
  performURIparameters: () => {
    let params = (new URL(document.location)).searchParams;
    let name = params.get('sf');
    if (name){
      let input = document.querySelector(`[name="f-sf"][value="${name}"]`)
      input.checked = true;
    }
  },

  updateOpenersValues: (categorie) => {

    let similarInputs = document.querySelectorAll(`[name="${categorie}"]:checked`),
        checkedValues = []

    similarInputs.forEach(i => {
      checkedValues.push(i.getAttribute("value"))
    })

    document.querySelector(`label[for="filter_by_${categorie.substring(2)}"] .value`).innerHTML = checkedValues.join(', ')
  },

  // This function uncheck Openers
  checkboxAsRadio: (justChanged) => {

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
  },

  removeInitCLass: () => {
    if(main.classList.contains('init')){
      main.classList.remove('init')
      if(document.querySelector('input[name="open_filter"]:checked')){
        document.querySelector('input[name="open_filter"]:checked').checked = false
      }
    }
  },


  events: () => ({

    watchCategorie: () => {
      // This set interaction on subcategorie selection
      openers.forEach( opener => {
        opener.addEventListener('change', evt => project_list().checkboxAsRadio(evt.target))
        opener.addEventListener('change', project_list().removeInit, {once: true})

        // Update value on opener when possible start checked items
        let categorie = 'f-' + opener.id.slice(-2)
        project_list().updateOpenersValues(categorie)
      })

    },

    watchSubCategorie: () => {
      // This add or update a text value of selected subcategory next categories title 
      items.forEach( item => {
        item.addEventListener('change', evt => {
          let categorie = (evt.target).getAttribute('name')
          project_list().updateOpenersValues(categorie)
        })
        item.addEventListener('change', project_list().removeInit, {once: true})
      })
    },

    watchFirstInteraction: () =>{

      // This remove init class after first interaction
      if(main.classList.contains('init')){
        _map.section.el.addEventListener('click', project_list().removeInit, {once: true})
      }
    },

    watchProjectListInteractions: () => {

      // This set abilities to focus map on project implentation based on lat/long coord
      document.querySelectorAll('.list.projets [data-map-point]').forEach(el => {
        let id_to_target     = el.getAttribute('data-map-point')
        let island_to_target = el.getAttribute('data-island')

                  //Temp
                  //Temp
                  //Temp
                  project_map().getPerfectRatio('l-Martinique')
                  project_map().setFocusPoint(108, 156)
                  //Temp
                  //Temp

        el.addEventListener("mouseenter", () => { 
          project_map().getPerfectRatio(island_to_target)
          project_map().setTransform()
          
          let coord = project_map().getCoord(id_to_target)
          project_map().setFocusPoint(coord[0], coord[1])

        })
      })
    },

    disableSingleMode: () => {
      // This hide Single Vue Mode on user clic 
      document.querySelector('#filter > button').addEventListener("click", () => {
          let id = document.querySelector('[data-active="true"]').getAttribute('data-map-point')
          project_list().setVueMode(false, id)
      })
    }
  }),

  onLoad: () => {
    project_list().performURIparameters()

    project_list().events().watchCategorie()
    project_list().events().watchSubCategorie()
    project_list().events().watchFirstInteraction()
    project_list().events().watchProjectListInteractions()
    project_list().events().disableSingleMode()
  }
})

const project_map = () => ({

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

    project_map().validMinr()

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

    project_map().validMaxt()
    project_map().setTransform();


  },

  setVueMode: (single, id) => {
    main.setAttribute('data-vue', single == true ?  'single' : 'list')

    document.querySelector(`.list.projets [data-map-point="${id}"]`)
      .setAttribute('data-active', single == true ? true : false)
  },

  events: () => {

    //  Drag & Zoom based on https://codepen.io/stack-getover/pen/VwPgQQr
    window.start = { x: 0, y: 0 }
    window.panning = false


    return {

      watchMouseDown: () => {
        // This trigger drag permission
        _map.section.el.addEventListener("mousedown", function(e) {
          start = { x: e.clientX, y: e.clientY };
          panning = true
          project_list().removeInitCLass()
        })
      },

      watchMouseMove: () => {

        // This drag by translation svg map based on mouse move
        _map.section.el.addEventListener("mousemove", function(e) {
          if (panning === true) {

            tX = tX + (e.clientX - start.x) //  * ratio - 1;
            tY = tY + (e.clientY - start.y) //  * ratio - 1;

            project_map().validMaxt()

            _map.svg.el.style.setProperty('--tX', `${tX}px`);
            _map.svg.el.style.setProperty('--tY', `${tY}px`);

            start.x = e.clientX 
            start.y = e.clientY
            
          }
        })
      },

      watchMouseUp: () => {
        // This end drag premission on mouse up      
        _map.section.el.addEventListener("mouseup", function(e) {
          panning = false
        });
      },

      watchWheel: () => {

        // This Zoom In / Out based on wheel event
        _map.section.el.addEventListener("wheel", function(e) {
          e.preventDefault();
          e.stopPropagation();

          project_list().removeInitCLass()

          var   xs    = (e.clientX - tX) / r,
                ys    = (e.clientY - tY) / r,
                delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
          (delta > 0) ? (r *= 1.2) : (r /= 1.2);
          
          project_map().validMinr()

          tX = (e.clientX - xs * r);
          tY = (e.clientY - ys * r);

          project_map().validMaxt()

          project_map().setTransform();      
        })
      },

      watchPointInteraction: () => {

        // This focus / display project card if user clic on its map location 
        document.querySelectorAll('.etiquette').forEach(el => {
          el.addEventListener("click", () => {

            let alreadyActive = document.querySelector(`.list.projets [data-active="true"]`)
            if(alreadyActive && alreadyActive.getAttribute('data-map-point') == el.id){
              // Project is already in Single Mode. Time to shut it down
              project_list().setVueMode(false, el.id)
            } else if(alreadyActive) {
              // A project is already open and there is a new project to see
              alreadyActive.setAttribute('data-active', false)
              project_list().setVueMode(true, el.id)
            } else {
              // No project is open and there is a project to see
              project_list().setVueMode(true, el.id)
            }
            
          })
        })
      }
    }
  },

  onLoad: () => {

    project_map().events().watchMouseDown()
    project_map().events().watchMouseMove()
    project_map().events().watchMouseUp()
    project_map().events().watchWheel()
    project_map().events().watchPointInteraction()

  }
})
