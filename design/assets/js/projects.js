 // Openers are three hidden input to open three list of item filter
let openers  = document.querySelectorAll('[name="open_filter"]'),
    items    = document.querySelectorAll('[name^="f-"]'),
    labels    = document.querySelectorAll('[for^="f-"]'),
    items_lo = document.querySelectorAll('[name="f-lo"]'),
    projects = document.querySelectorAll('[data-map-point]')

let _map = {

  section: {
    el:     document.querySelector("#map"),
    width:  document.querySelector("#map").getBoundingClientRect().width,
    height: document.querySelector("#map").getBoundingClientRect().height
  },

  on: 'l-Guadeloupe',
  
  svg: {
    el: document.querySelector("#main_map"),
    viewbox: 495
  },

  tX:           0,
  tY:           0,
  minR:         4,
  maxR:         8,
  avgR:         4,
  focusR:       6,
  hard_focusR:  8,
  ratio:        4,
  focusOn:      null,
  active_island: [],

  active_categories: {
    ty: [],
    sf: [],
    lo: []
  }
}

/**
 * The `project_list` object contains methods for managing the list of projects.
 */
const project_list = () => ({

  removeInit: () => {
    if(main.classList.contains('init')){
      main.classList.remove('init')

      // Three openers can triggers it. 
      openers.forEach( opener => {
        opener.removeEventListener("change", project_list().removeInit, true)
        _map.section.el.removeEventListener("change", project_list().removeInit, true)
      })

      // Once called, we destroy the two other triggers.
      items.forEach( item => {
        item.removeEventListener("change", project_list().removeInit, true)
      })
    }
  },

  /**
   * Checks the URI parameters for users comming from the Savoir-faire page, 
   * if it exists, selects the corresponding checkbox in the filters section.
   */
  performURIparameters: () => {
    let params = (new URL(document.location)).searchParams;
    let name = params.get('sf');
    if (name){
      let input = document.querySelector(`[name="f-sf"][value="${name}"]`)
      input.checked = true;
      project_list().checkIfListIsEmpty()
    }
  },

  /**
   * Updates UI selected filter value
   * @param  {string} categorie Categorie name to update
   */
  trackOpeners: (categorie) => {

    let similarInputs = document.querySelectorAll(`[name="${categorie}"]:checked`),
        checkedValues = [],
        checkedId = []

    similarInputs.forEach(i => {
      checkedValues.push(i.getAttribute("value"))
      checkedId.push(i.getAttribute("id").slice(5))
    })

    // Update Interface Recall
    document.querySelector(`label[for="filter_by_${categorie.substring(2)}"] .value`).innerHTML = checkedValues.join(', ')

    // update map object
    _map.active_categories[categorie.substring(2)] = checkedId
    //console.log(_map.active_categories)
  },

  /**
   * Manage project filter behavior. 
   * Act as Radio input
   * @param {Element} justChanged The element that was just checked.
   */
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
        project_list().trackOpeners(categorie)
      })

    },

    watchSubCategorie: () => {

      const callback = (el) => {
        let categorie = (el).getAttribute('name')
        // This add or update a text value 
        // of selected subcategory next categories title 
        project_list().trackOpeners(categorie)
        // 
        project_list().checkIfListIsEmpty()
        // 
        project_map().colorRelativePoints().update()
      } 

      const initCallback = (el) => {
        console.log(el)
          if(main.classList.contains('init')){
            let category = el.getAttribute('name').slice(-2);
            document.getElementById('filter_by_' + category).checked = true
            project_list().removeInit()
          }
      }

      const forceChecking = (item) => {
        item.checked = !item.checked;
      }

      items.forEach( (item) => {
        item.addEventListener('change', e => callback(e.target) )
        item.addEventListener('change', e => initCallback(e.target), {once: true} )
      })

      // Fallback if keyboard navigation
      // Allow to check Input with Enter key
      labels.forEach( (label) => {
        let item = document.getElementById(label.getAttribute("for"))
        label.addEventListener('keydown', e => {
          if (e.key === 'Enter') {
            callback(item)
            forceChecking(item)
          }
        })
        label.addEventListener('keydown', e => {
          if (e.key === 'Enter') {
            initCallback(item)
          }
        },{once: true});
      })

    },

    // Watch localisation filter
    watchSubCategorie_lo: () => {
      // This check number of selected island  and focus on selected one if single
      items_lo.forEach( item_lo => {
        item_lo.addEventListener('change', evt => {
          
          _map.active_island = []

          // Update active island with all item checked
          items_lo.forEach( item => {
            if(item.checked == true){
              _map.active_island.push(`l-${item.value}`)
            }
          })

          if(_map.active_island.length == 1){
            // If just one island checked
            _map.ratio = _map.focusR
            project_map().setTransform()
            let coord = project_map().getCoord(_map.active_island[0])
            project_map().focusOnPoint(coord[0], coord[1])
            _map.focusOn = coord;
          } else {
            // Else just get map medium point 
            _map.ratio = _map.avgR
            project_map().setTransform()
            project_map().focusOnPoint(_map.focusOn[0], _map.focusOn[1])
          }

        })
      })
    },

    watchFirstInteraction: () =>{

      // This remove init class after first interaction
      if(main.classList.contains('init')){
        addCombinedClickListener(_map.section.el, project_list().removeInit, true)
      }
    },

    watchProjectListInteractions: () => {

      // This set abilities to focus map on project implentation based on lat/long coord
      let projets_el = document.querySelector('.list.projets')

      // Using event delegation
      projets_el.addEventListener("click", el => {

        // Return if void click
        if(el.target.matches('.list.projets')){return}

        // Get closest card
        el = el.target.closest('[data-map-point]')

        let id_to_target     = el.getAttribute('data-map-point')
        let island_to_target = el.getAttribute('data-island')
        let landing_point = _map.section.el.querySelector(`#${id_to_target}`)

        // tweak point overflow
        project_map().downElOnDOM(landing_point)

        if(main.getAttribute('data-vue') == 'single'){return}

        // If landing point is cleared around
        _map.ratio = _map.focusR

        // if no island to focus
        if(!_map.active_island[0]){
          _map.active_island.push(island_to_target)
        }

        coord = project_map().getCoord(island_to_target)

        project_map().validMinR()
        project_map().setClassbyScale()
       
        project_map().focusOnPoint(coord[0], coord[1])
        _map.focusOn = coord;

        landing_point.classList.add('focus');

        // Set little interaction on landing point
        landing_point.animate(
          [
            // étapes/keyframes
            { r: "1", fill: "var(--cR)" },
            { r: "3px", fill: "var(--cR)" },
            { r: "1px", fill: "var(--cR)" },
          ],
          {
            // temporisation
            duration: 600,
            delay: 100,
            iterations: 2,
            effect: "cubic-bezier(.68,-0.55,.27,1.55)"
          },
        );
                

        /*el.addEventListener("mouseleave", () => {
          landing_point.classList.remove('focus');
        })*/

      })

      document.querySelector('.list.projets').addEventListener('mouseleave', () => {
        
        if( _map.focusOn != null && main.getAttribute('data-vue') != 'single' && _map.active_island.length != 1
          ){
          _map.ratio = _map.avgR
          project_map().setTransform()
          let coord = project_map().getCoord('l-Guadeloupe')
          project_map().focusOnPoint(coord[0], coord[1])

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
      document.querySelector('#filter #closeProject').addEventListener("click", el => {
          let id = document.querySelector('[data-active="true"]').getAttribute('data-map-point')
          project_map().setVueMode(false, id)

          el.target.setAttribute('aria-hidden', true)
          
          _map.ratio = _map.avgR
          project_map().validMinR()
          project_map().setClassbyScale()
          
          project_map().setTransform()
          project_map().focusOnPoint(_map.focusOn[0], _map.focusOn[1])

          project_map().colorRelativePoints().update()

      })
    }
  }),

  onLoad: () => {
    project_list().performURIparameters()

    project_list().events().watchCategorie()
    project_list().events().watchSubCategorie()
    project_list().events().watchSubCategorie_lo()
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
    }
  },

  setClassbyScale: () => {
    if(_map.ratio <= _map.minR + 2 ){
      _map.svg.el.classList = `no-scale`
    } else if(_map.ratio > _map.hard_focusR){
      _map.svg.el.classList = `scale-C`
      if(_map.ratio > _map.maxR) { _map.ratio = _map.maxR}
    } else if(_map.ratio > _map.focusR){
      _map.svg.el.classList = `scale-B`
    } else if(_map.ratio > _map.minR + 2 ){
      _map.svg.el.classList = `scale-A`
    }
  },

  validMaxt: () => {
    offset = 50 // Far west isn't a friendly world
    let minX = offset * -_map.ratio,
        maxX = (_map.section.width * -_map.ratio) + (_map.section.width)
        minY = _map.section.height / 2,
        maxY = (_map.section.height * -_map.ratio / 2) + (_map.section.height)

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
    project_map().setClassbyScale()
  },

  getCoord: (el) => {

    if(el && typeof el == 'string'){
      //console.log(el)
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

    document.querySelector('#closeProject')
      .setAttribute('aria-hidden', single == true ? false : true)

    if(!single){
      project_map().colorRelativePoints().resetSingle()
    }
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

  downElOnDOM: (el) => {
    let container = el.parentNode
    container.appendChild(el);
  },


  colorRelativePoints: () => {

    return {

      addClass: (el, clss = "focus") => {
        el.classList.add(clss)
        project_map().colorRelativePoints().bringPointToFront(el)
      },

      removeClass: (el, clss = "focus") => {
        el.classList.remove(clss)
      },

      bringPointToFront: (el) => {
        const parent = el.parentNode
        const sibling = el.nextElementSibling

        parent.appendChild(el)

        if(sibling){
          parent.appendChild(sibling)
        }
      },

      reset: () => {
        // Reset Active class on points
        let actives = document.querySelectorAll('#map .pt.focus')
        if(actives.length > 0){
          actives.forEach( el => { 
            project_map().colorRelativePoints().removeClass(el)
          })
        }
      },

      resetSingle: () => {
        let el = document.querySelector(".pt.single")
        project_map().colorRelativePoints().removeClass(el, "single")
      },

      update: () => {
        
        // reset
        project_map().colorRelativePoints().reset()
        
        // Compose our perfect selector
        let selector = ""

        Object.keys(_map.active_categories).forEach((key) => {
          _map.active_categories[key].forEach((value) => {
            selector += `[data-${key}*="${value},"]`;
          });
        });

        // Add Active class when needed
        if(selector.length > 0){
          let toActivate = document.querySelectorAll("#map .pt" + selector)
          console.log("#map circle" + selector)
          if(toActivate.length > 0){
            toActivate.forEach( el => { 
              project_map().colorRelativePoints().addClass(el)
            })
          }
        }

      }
    }

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
          project_map().setClassbyScale()

          _map.tX = (e.clientX - xs * _map.ratio);
          _map.tY = (e.clientY - ys * _map.ratio);

          project_map().validMaxt()

          project_map().setTransform();
        })
      },

      watchPointInteraction: () => {


        // This focus / display project card if user clic on its map location 
        document.querySelectorAll('.pt').forEach(el => {

          el.addEventListener("click", () => {

            let alreadyActive = document.querySelector(`.list.projets [data-active="true"]`)
            
            // Is this project already in Single Mode. 
            if(alreadyActive && alreadyActive.getAttribute('data-map-point') == el.id){
              
              // Time to shut it down
              project_map().setVueMode(false, el.id)
              
              // Reset colors point based on selected Categories
              project_map().colorRelativePoints().removeClass(el, "single")
              project_map().colorRelativePoints().update()

            } else {

              _map.focusOn = [
                parseFloat(el.getAttribute('data-x')),
                parseFloat(el.getAttribute('data-y'))
              ]

              _map.ratio = _map.focusR + 1
    
              // Is point is part of a compact group ?
              let couldCompact = el.parentNode.classList.contains('parent')
    
              if(alreadyActive) {
                // A project is already open and there is a new project to see
                alreadyActive.setAttribute('data-active', false)
                project_map().setVueMode(true, el.id)

                // remove single class to old
                project_map().colorRelativePoints().resetSingle()
                

              } else {
                // No project is open and there is a project to see
                project_map().setVueMode(true, el.id)
              }

              // Add Single class to new
              project_map().colorRelativePoints().addClass(el, "single")
            } 

            // Update tranform because of ratio update
            project_map().focusOnPoint(_map.focusOn[0], _map.focusOn[1])
            project_map().validMinR()
            project_map().setClassbyScale()
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

project_map().focusOnPoint(191, 96)
items.forEach( item => item.checked = false)



