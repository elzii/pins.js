function InteractiveMap(options) {
  
  var _this = this;

  /**
   * Default Options
   * @type {Object}
   */
  this.options      = options || {};
  this.debug        = options.debug || false;
  this.selector     = options.selector || '.map';
  this.markerClass  = options.markerClass || 'marker';
  this.markers      = options.markers || [];
  this.draggable    = options.draggable || false;



  this.container = document.querySelectorAll(_this.selector).length ? document.querySelectorAll(_this.selector)[0] : false;

  if ( !this.container ) {
    console.error('Element with selector "' + this.selector + '" does not exist')
    return false
  }

  /**
   * Apply Required CSS
   * @return {null}
   */
  this.applyRequiredStyles = function() {
    // container
    _this.container.style.position = 'relative'
  }

  this.requiredMarkerStyles = function() {
    return {
      position: 'absolute',
      transform: 'translate3d(-50%, -50%, 0)',
      cursor: 'pointer'
    }
  }

  /**
   * Get Container Dimensions
   * @return {Object} width,height
   */
  this.getContainerDimensions = function(boundingRect) {

    if ( boundingRect ) {
      var rect = _this.container.querySelector('img').getBoundingClientRect()
      return {
        width: rect.width,
        height: rect.height
      }
    } else {
      return {
        width: _this.container.clientWidth,
        height: _this.container.clientHeight
      }
    }

  }

  /**
   * Convert Percent to Pixels
   * Accepts a value between [0,1] or [1,100] and converts it to a relative pixel value
   * 
   * @param  {Number} percent 
   * @param  {Number} pixels  
   * @return {Number} 
   */
  this.convertPercentToPx = function(percent, pixels) {
    // percent = percent ? percent : 1;
    // pixels  = pixels ? pixels : 1;

    if ( percent <= 1 && percent > 0 ) {
      return parseInt( pixels * percent )
    } 
    else {
      return parseInt( (pixels/100) * percent )
    }
  }


  this.convertPxToPercent = function(pixels, container) {
    // pixels  = pixels ? pixels : 1;
    container = container ? container : _this.container;

    return (pixels / container)
    
  }

  /**
   * Draw Markers
   * Draw the markers on the screen. Runs only once, then refer to updateMarkers()
   */
  this.drawMarkers = function() {
    for ( var i=0; i<_this.markers.length; i++ ) {

      var x = _this.convertPercentToPx( _this.markers[i].x, _this.getContainerDimensions().width )
      var y = _this.convertPercentToPx( _this.markers[i].y, _this.getContainerDimensions().height )

      var marker = document.createElement('div')
          marker.className = _this.markerClass;

      // Apply required marker styles
      Object.keys( _this.requiredMarkerStyles() ).forEach(function(prop, i) {
        marker.style[prop] = _this.requiredMarkerStyles()[prop]
      })

      // Set coords
      marker.style.left = x+'px'
      marker.style.top = y+'px'

      // Append to DOM
      _this.container.appendChild(marker)
    }
  }

  /**
   * Update Markers
   */
  this.updateMarkers = function() {
    var markers = _this.container.querySelectorAll( '.'+_this.markerClass )

    for ( var i=0; i<markers.length; i++ ) {
      var x = _this.convertPercentToPx( _this.markers[i].x, _this.getContainerDimensions(true).width )
      var y = _this.convertPercentToPx( _this.markers[i].y, _this.getContainerDimensions(true).height )

      markers[i].style.left = x+'px'
      markers[i].style.top = y+'px'
    }
  }




  this.onResize = function(event) {
    // Do something always
    _this.updateMarkers()
    // Provide hook
    if ( _this.options.onResize ) _this.options.onResize(event)
  }

  this.onMarkerClick = function(event) {
    if ( _this.options.onMarkerClick ) _this.options.onMarkerClick(_this, event)
  }

  // Attach event listeners
  this.attachEventListener = function(item, type, func) {
    if ( typeof item !== "undefined" ) {
      if ( item.length > 0 ) {
        item.forEach(function(el, i) {
          el.addEventListener(type, func)
        })
      } else {
        item.addEventListener(type, func, false)
      }
    }
    
  }

  this.attachEventListeners = function() {
    _this.attachEventListener( window, 'resize', _this.onResize )
    _this.attachEventListener( document.querySelectorAll( '.'+_this.markerClass ), 'click', _this.onMarkerClick )
  }



  /**
   * Debug
   */
  this.debugger = function() {
    if ( this.debug ) {
      var debugStyles = document.createElement('style')
          debugStyles.type = 'text/css'

      var css = ' \
        .map { border: 1px solid cyan; } \
        .marker { background-color: red; width: 10px; height: 10px; } \
      ';

      if ( debugStyles.styleSheet ) {
        debugStyles.styleSheet.cssText = css;
      } else {
        debugStyles.appendChild(document.createTextNode(css))
      }

      document.body.appendChild(debugStyles)


      // Draggable
      var draggable = document.getElementsByClassName( 'marker' ),
          draggableCount = draggable.length, 
          i; 
      
      function startDrag(evt) {        
        var diffX = evt.clientX - this.offsetLeft,
            diffY = evt.clientY - this.offsetTop,
            that = this; 

        function moveAlong(evt) {
          that.style.left = (evt.clientX - diffX) + 'px';
          that.style.top = (evt.clientY - diffY) + 'px';
        }
        function stopDrag() {
          document.removeEventListener('mousemove', moveAlong);
          document.removeEventListener('mouseup', stopDrag);
        }

        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('mousemove', moveAlong);
      }

      for (i = 0; i < draggableCount; i += 1) {
        draggable[i].addEventListener('mousedown', startDrag);
      }
    }
  }
  

  this.onBeforeInit = function(cb) {
    if ( _this.options.onBeforeInit ) _this.options.onBeforeInit(_this, event)
  }

  this.onAfterInit = function(cb) {
    if ( _this.options.onAfterInit ) _this.options.onAfterInit(_this, event)
  }


  /**
   * Initialize
   */
  this.init = function() {
    _this.applyRequiredStyles()
    _this.drawMarkers()
    _this.attachEventListeners()
    _this.debugger()
  }

  this.onBeforeInit()
  this.init()
  this.onAfterInit()
}