 // Openers are three hidden input to open three list of item filter
let openers  = document.querySelectorAll('[name="open_filter"]'),
    items    = document.querySelectorAll('[name^="f-"]'),
    labels    = document.querySelectorAll('[for^="f-"]'),
    items_lo = document.querySelectorAll('[name="f-lo"]'),
    projects = document.querySelectorAll('[data-point_id]')

let view = {

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
        view.section.el.removeEventListener("change", project_list().removeInit, true)
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
    view.active_categories[categorie.substring(2)] = checkedId
    //console.log(view.active_categories)
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
          
          view.active_island = []

          // Update active island with all item checked
          items_lo.forEach( item => {
            if(item.checked == true){
              view.active_island.push(`l-${item.value}`)
            }
          })

          if(view.active_island.length == 1){
            // If just one island checked
            view.ratio = view.focusR
            project_map().setTransform()
            let coord = project_map().getCoord(view.active_island[0])
            project_map().focusOnPoint(coord[0], coord[1])
            view.focusOn = coord;
          } else {
            // Else just get map medium point 
            view.ratio = view.avgR
            project_map().setTransform()
            project_map().focusOnPoint(view.focusOn[0], view.focusOn[1])
          }

        })
      })
    },

    watchFirstInteraction: () =>{

      // This remove init class after first interaction
      if(main.classList.contains('init')){
        addCombinedClickListener(view.section.el, project_list().removeInit, true)
      }
    },

    watchProjectListInteractions: () => {

      // This set abilities to focus map on project implentation based on lat/long coord
      let projectsList = document.querySelector('.list.projets')

      // Using event delegation
      projectsList.addEventListener("click", handleProjectClick)
      projectsList.addEventListener('mouseleave', handleMouseLeave)

      function handleProjectClick(el){

        // Get closest card
        clickedElement = el.target.closest('[data-point_id]')

        // Return if void click
        if (!clickedElement) return; 

        const { point_id, island } = clickedElement.dataset;
        let landing_point = view.section.el.querySelector(`#${point_id}`)

        // Ensure visibility
        project_map().downElOnDOM(landing_point)

        // Focus map
        if(main.getAttribute('data-vue') !== 'single'){
          focusMapOnPoint(island);
        }

        // Add class for CSS style change
        landing_point.classList.add('focus');

        // Trigger short animation
        animatePoint(landing_point)
                
      }

      function focusMapOnPoint(island) {

        // if no island to focus
        if(!view.active_island[0]){
          view.active_island.push(island)
        }

        coord = project_map().getCoord(island)
        // If landing point is cleared around
        view.ratio = view.focusR

        project_map().validMinR()
        project_map().setClassbyScale()
       
        project_map().focusOnPoint(coord[0], coord[1])
        view.focusOn = coord;

      }  

      function animatePoint(point){
        point.animate(
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
      }

      function handleMouseLeave(){
        if( view.focusOn != null && main.getAttribute('data-vue') != 'single' && view.active_island.length != 1
          ){
          view.ratio = view.avgR
          project_map().setTransform()
          let coord = project_map().getCoord('l-Guadeloupe')
          project_map().focusOnPoint(coord[0], coord[1])

        }
      }
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
          let id = document.querySelector('[data-active="true"]').getAttribute('data-point_id')
          project_map().setVueMode(false, id)

          el.target.setAttribute('aria-hidden', true)
          
          view.ratio = view.avgR
          project_map().validMinR()
          project_map().setClassbyScale()
          
          project_map().setTransform()
          project_map().focusOnPoint(view.focusOn[0], view.focusOn[1])

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
    if(view.ratio < view.minR){
      view.ratio = view.minR
    }
  },

  setClassbyScale: () => {
    if(view.ratio <= view.minR + 2 ){
      view.svg.el.classList = `no-scale`
    } else if(view.ratio > view.hard_focusR){
      view.svg.el.classList = `scale-C`
      if(view.ratio > view.maxR) { view.ratio = view.maxR}
    } else if(view.ratio > view.focusR){
      view.svg.el.classList = `scale-B`
    } else if(view.ratio > view.minR + 2 ){
      view.svg.el.classList = `scale-A`
    }
  },

  validMaxt: () => {
    offset = 50 // Far west isn't a friendly world
    let minX = offset * -view.ratio,
        maxX = (view.section.width * -view.ratio) + (view.section.width)
        minY = view.section.height / 2,
        maxY = (view.section.height * -view.ratio / 2) + (view.section.height)

    if( view.tX > minX ){ 
      view.tX = minX
    } else if( view.tX < maxX ){ 
      view.tX = maxX }
    if( view.tY > minY ){ 
      view.tY = minY
    } else if(view.tY < maxY ){ 
      view.tY = maxY 
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

    view.ratio = view.section.width  / (baseIsland * 3)

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
    view.svg.el.style.setProperty('--tX', `${view.tX}px`);
    view.svg.el.style.setProperty('--tY', `${view.tY}px`);
    view.svg.el.style.setProperty('--r', view.ratio);
  },

  setVueMode: (single, id) => {
    main.setAttribute('data-vue', single == true ?  'single' : 'list')

    document.querySelector(`.list.projets [data-point_id="${id}"]`)
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
    let deformRatio = view.section.width / view.svg.viewbox

    let centerWidth   = view.section.width  / 2 
        centerHeight  = view.section.height / 2

    // Ratio Increase by de
    let factor = view.ratio * deformRatio * -1

    view.tX = x * (view.ratio * -1) + centerWidth;
    view.tY = y * (view.ratio * -1) + centerHeight;

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

        Object.keys(view.active_categories).forEach((key) => {
          view.active_categories[key].forEach((value) => {
            selector += `[data-${key}*="${value},"]`;
          });
        });

        // Add Active class when needed
        if(selector.length > 0){
          let toActivate = document.querySelectorAll("#map .pt" + selector)
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
        view.section.el.addEventListener("mousedown", function(e) {
          start = { x: e.clientX, y: e.clientY };
          panning = true
          project_list().removeInitCLass()
        })
      },

      watchMouseMove: () => {

        // This drag by translation svg map based on mouse move
        view.section.el.addEventListener("mousemove", function(e) {
          if (panning === true) {

            view.tX = view.tX + (e.clientX - start.x) //  * ratio - 1;
            view.tY = view.tY + (e.clientY - start.y) //  * ratio - 1;

            project_map().validMaxt()

            view.svg.el.style.setProperty('--tX', `${view.tX}px`);
            view.svg.el.style.setProperty('--tY', `${view.tY}px`);

            start.x = e.clientX 
            start.y = e.clientY
            
          }
        })
      },

      watchMouseUp: () => {
        // This end drag premission on mouse up      
        view.section.el.addEventListener("mouseup", function(e) {
          panning = false
        });
      },

      watchWheel: () => {

        // This Zoom In / Out based on wheel event
        view.section.el.addEventListener("wheel", function(e) {
          e.preventDefault();
          e.stopPropagation();

          project_list().removeInitCLass()

          var   xs    = (e.clientX - view.tX) / view.ratio,
                ys    = (e.clientY - view.tY) / view.ratio,
                delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
          (delta > 0) ? (view.ratio *= 1.2) : (view.ratio /= 1.2);
          
          project_map().validMinR()
          project_map().setClassbyScale()

          view.tX = (e.clientX - xs * view.ratio);
          view.tY = (e.clientY - ys * view.ratio);

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
            if(alreadyActive && alreadyActive.getAttribute('data-point_id') == el.id){
              
              // Time to shut it down
              project_map().setVueMode(false, el.id)
              
              // Reset colors point based on selected Categories
              project_map().colorRelativePoints().removeClass(el, "single")
              project_map().colorRelativePoints().update()

            } else {

              view.focusOn = [
                parseFloat(el.getAttribute('data-x')),
                parseFloat(el.getAttribute('data-y'))
              ]

              view.ratio = view.focusR + 1
    
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
            project_map().focusOnPoint(view.focusOn[0], view.focusOn[1])
            project_map().validMinR()
            project_map().setClassbyScale()
            project_map().setTransform()
          })

        })
      },

      watchScreenResize: () => {
        onresize = (event) => {
          view.section.width  = view.section.el.getBoundingClientRect().width
          view.section.height = view.section.el.getBoundingClientRect().height
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



