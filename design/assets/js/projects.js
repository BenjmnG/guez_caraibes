// Openers are three hidden input to open three list of item filter
let openers  = document.querySelectorAll('[name="open_filter"]'),
    items    = document.querySelectorAll('[name^="f-"]'),
    projects = document.querySelectorAll('[data-map-point]')

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
  },

  tX:      0,
  tY:      0,
  minR:    4,
  maxR:    80,
  ratio:   4,
  focusOn: null
}

const project_list = () => ({

  // This function remove init class on main. Three openers can triggers it. Once called, we destroy the two other triggers.
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

  checkIfListIsEmpty: () =>{
    let visible = 0;
    document.querySelector('.list.projets').classList.remove('empty')
    
    projects.forEach( project => {
      if(window.getComputedStyle(project).display === "block"){
        visible++
        return
      }
    })

    if(visible == 0){
      document.querySelector('.list.projets').classList.add('empty')
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
          project_list().checkIfListIsEmpty()
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
        let delayEvent 

        el.addEventListener("mouseenter", () => {

          if(main.getAttribute('data-vue') == 'single'){return}

          clearTimeout(delayEvent);
          

          // FUnction will run in delay unless another elemnt trigg it
          delayEvent = setTimeout(function() {

            project_map().getPerfectRatio(island_to_target)
            _map.ratio +=5
            project_map().setTransform()

            let coord = project_map().getCoord(id_to_target)
            project_map().focusOnPoint(coord[0], coord[1])
            _map.focusOn = coord;

            _map.section.el.querySelector(`#${id_to_target}`).classList.add('focus')

            el.addEventListener("mouseleave", () => {
              let focusedPoint = document.querySelector('.etiquette.focus')
              if(focusedPoint){
                focusedPoint.classList.remove('focus')
              }
            })

          }, 200);
        })
      })

      document.querySelector('.list.projets').addEventListener('mouseleave', () => {
        if(_map.focusOn != null && main.getAttribute('data-vue') != 'single'){
          _map.ratio /= 4
          project_map().validMinR()
          project_map().setTransform()
          project_map().focusOnPoint(_map.focusOn[0], _map.focusOn[1])
          _map.focusOn = null
        }
      })
    },

    watchCloseAllFiltersInteraction: () => {

      document.querySelector('#closeAllFilters').addEventListener('click', e => {
        openers.forEach( opener => {
          opener.checked = false
        } )
      })
    },
    disableSingleMode: () => {
      // This hide Single Vue Mode on user clic 
      document.querySelector('#filter #closeProject').addEventListener("click", () => {
          let id = document.querySelector('[data-active="true"]').getAttribute('data-map-point')
          project_map().setVueMode(false, id)
          
          _map.ratio /= 4
          project_map().validMinR()
          
          project_map().setTransform()
          project_map().focusOnPoint(_map.focusOn[0], _map.focusOn[1])
          _map.focusOn = null
      })
    }
  }),

  onLoad: () => {
    project_list().performURIparameters()

    project_list().events().watchCategorie()
    project_list().events().watchSubCategorie()
    project_list().events().watchFirstInteraction()
    project_list().events().watchProjectListInteractions()
    project_list().events().watchCloseAllFiltersInteraction()
    project_list().events().disableSingleMode()
  }
})

const project_map = () => ({

  validMinR: () => {
    if(_map.ratio < _map.minR){
      _map.ratio = _map.minR
    } else if(_map.ratio <= _map.minR+ 2 ){
      _map.svg.el.classList = `no-scale`
    } else if(_map.ratio > _map.minR+ 6){
      _map.svg.el.classList = `scale-B`

      if(_map.ratio > _map.maxR) { _map.ratio = _map.maxR}

    } else if(_map.ratio > _map.minR + 2 ){
      _map.svg.el.classList = `scale-A`
    }
  },

  validMaxt: () => {
    offset = 100 // Far west isn't a friendly world
    let minX = offset * -_map.ratio,
        maxX = (_map.section.width * -_map.ratio) + (_map.section.width)
        minY = _map.section.height / 2,
        maxY = (_map.section.height * -_map.ratio) + (_map.section.height)
    
    if( _map.tX > minX ){ 
      _map.tX = minX
    } else if( _map.tX < maxX ){ 
      _map.tX = maxX }
    if( _map.tY > minY ){ 
      _map.tY = minY
    } else if(_map.tY < maxY ){ 
      _map.tY = maxY 
    }

  },

  getPerfectRatio: (id = null) => {

    let baseIsland = 13
    if(id == 'l-Martinique'){
      baseIsland = 13
    } else if (id == 'l-Guadeloupe'){
      baseIsland = 13
    } else if (id == 'l-Saint-Martin'){
      baseIsland = 3
    } else {
      baseIsland = 13
    }

    _map.ratio = _map.section.width  / (baseIsland * 3)

    project_map().validMinR()

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
    _map.svg.el.style.setProperty('--tX', `${_map.tX}px`);
    _map.svg.el.style.setProperty('--tY', `${_map.tY}px`);
    _map.svg.el.style.setProperty('--r', _map.ratio);
  },

  setVueMode: (single, id) => {
    main.setAttribute('data-vue', single == true ?  'single' : 'list')

    document.querySelector(`.list.projets [data-map-point="${id}"]`)
      .setAttribute('data-active', single == true ? true : false)
  },

  focusOnPoint: (x, y) => {

    //console.log('go to : ', x, y)

    let pt_radius = 1 / 2;

    // Deform Ratio is the relation between SVG viewbox and container (1.5/1 on 1080 pixel screen)
    let deformRatio = _map.section.width / _map.svg.viewbox

    let centerWidth   = _map.section.width  / 2 
        centerHeight  = _map.section.height / 2

    // Ratio Increase by de
    let factor = _map.ratio * deformRatio * -1

    _map.tX = x * (_map.ratio * -1) + centerWidth;
    _map.tY = y * (_map.ratio * -1) + centerHeight;

    project_map().validMaxt()
    project_map().setTransform();

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

            _map.tX = _map.tX + (e.clientX - start.x) //  * ratio - 1;
            _map.tY = _map.tY + (e.clientY - start.y) //  * ratio - 1;

            project_map().validMaxt()

            _map.svg.el.style.setProperty('--tX', `${_map.tX}px`);
            _map.svg.el.style.setProperty('--tY', `${_map.tY}px`);

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

          var   xs    = (e.clientX - _map.tX) / _map.ratio,
                ys    = (e.clientY - _map.tY) / _map.ratio,
                delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
          (delta > 0) ? (_map.ratio *= 1.2) : (_map.ratio /= 1.2);
          
          project_map().validMinR()

          _map.tX = (e.clientX - xs * _map.ratio);
          _map.tY = (e.clientY - ys * _map.ratio);

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
              project_map().setVueMode(false, el.id)

              // Zoom out
              _map.ratio /= 4

            } else {
                if(alreadyActive) {
                // A project is already open and there is a new project to see
                alreadyActive.setAttribute('data-active', false)
                project_map().setVueMode(true, el.id)
              } else {
                // No project is open and there is a project to see
                project_map().setVueMode(true, el.id)
              }

              project_map().getPerfectRatio()
              _map.ratio +=5
              
              _map.focusOn = [
                parseFloat(el.getAttribute('data-x')),
                parseFloat(el.getAttribute('data-y'))
              ]

            }            

            // Update tranform because of ratio update
            project_map().focusOnPoint(_map.focusOn[0], _map.focusOn[1])
            project_map().validMinR()
            project_map().setTransform()
          })
        })
      },

      watchScreenResize: () => {
        onresize = (event) => {
          _map.section.width  = _map.section.el.getBoundingClientRect().width
          _map.section.height = _map.section.el.getBoundingClientRect().height
        };

      }
    }
  },

  onLoad: () => {

    project_map().events().watchMouseDown()
    project_map().events().watchMouseMove()
    project_map().events().watchMouseUp()
    project_map().events().watchWheel()
    project_map().events().watchPointInteraction()
    project_map().events().watchScreenResize()

  }
})



//Temp

project_map().focusOnPoint(108, 156)
items.forEach( item => item.checked = false)



