;(function (exports) {
  'use strict';

  function Markers(options) {  
    var self = this;

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

    this.container = document.querySelectorAll(self.selector).length ? document.querySelectorAll(self.selector)[0] : false;

    if ( !this.container ) {
      console.error('Element with selector "' + this.selector + '" does not exist')
      return false
    }

    
    this.applyInlineStyles = function(node, styles) {
      var elems  = [],
          styles = styles || {}

      if ( !!Object.prototype.toString.call(node).match(/NodeList/) ) {
        // console.log('NodeList', node)
        elems = node
      } else if ( !!Object.prototype.toString.call(node).match(/HTMLCollection/) ) {
        // console.log('HTMLCollection', node)
        elems = node
      } else if ( !!Object.prototype.toString.call(node).match(/HTMLDivElement/) ) {
        // console.log('HTMLDivElement', node)
        elems.push(node)
      } else if ( Array.isArray(node) )  {
        elems = node
      } else {
        throw new Error('applyInlineStyles(): First param must be an element')
      }
      
      for ( var i=0; i<elems.length; i++ ) {
        for ( var p in styles ) {
          // console.log(p, styles[p])
          elems[i].style[p] = styles[p] 
        }
      }
 
    }

    this.applyRequiredStyles = function() {
      this.applyInlineStyles( self.container, self.requiredContainerStyles() )
    }

    this.requiredContainerStyles = function() {
      // container
      return {
        position: 'relative',
        'user-select': 'none',
        transition: 'opacity 150ms linear'
      }
    }

    this.requiredMarkerStyles = function() {
      return {
        position: 'absolute',
        transform: 'translate3d(-50%, -50%, 0)',
        cursor: 'pointer',
      }
    }

    /**
     * Get Container Dimensions
     * @return {Object} width,height
     */
    this.getContainerDimensions = function(boundingRect) {

      if ( boundingRect ) {
        var rect = self.container.querySelector('img').getBoundingClientRect()
        return {
          width: rect.width,
          height: rect.height
        }
      } else {
        return {
          width: self.container.clientWidth,
          height: self.container.clientHeight
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
      container = container ? container : self.container;

      return (pixels / container)
      
    }

    this.detectMarkers = function() {
      var markers = self._find( self.container, document.getElementsByClassName( self.markerClass ))
      
      if ( !markers ) return false;

      for ( var i=0; i<markers.length; i++) {
        var data = markers[i].getAttribute('data-marker')
        if ( data ) {
          var marker = JSON.parse(data)
          self.markers.push(marker)
          markers[i].parentNode.removeChild(markers[i])
        } else {
          throw new Error('detectMarkers(): no data-marker attribute found')
        }
      }
    }


    /**
     * Draw Markers
     * Draw the markers on the screen. Runs only once, then refer to updateMarkers()
     */
    this.drawMarkers = function() {
      for ( var i=0; i<self.markers.length; i++ ) {

        var m = self.markers[i];

        var x = self.convertPercentToPx( m.x, self.getContainerDimensions().width )
        var y = self.convertPercentToPx( m.y, self.getContainerDimensions().height )

        var marker = document.createElement('div')
            marker.className = self.markerClass;

        // Apply required marker styles
        self.applyInlineStyles( marker, self.requiredMarkerStyles() )

        // Apply custom properties
        if ( m.props ) {  
          for ( var prop in m.props ) {
            marker.setAttribute(prop, m.props[prop])
          }
        }

        // Set coords
        marker.style.left = x+'px'
        marker.style.top = y+'px'

        // Append to DOM
        self.container.appendChild(marker)
      }
    }

    /**
     * Update Markers
     */
    this.updateMarkers = function() {
      var markers = self.container.querySelectorAll( '.'+self.markerClass )

      for ( var i=0; i<markers.length; i++ ) {
        var x = self.convertPercentToPx( self.markers[i].x, self.getContainerDimensions(true).width )
        var y = self.convertPercentToPx( self.markers[i].y, self.getContainerDimensions(true).height )

        markers[i].style.left = x+'px'
        markers[i].style.top = y+'px'
      }
    }




    this.onResize = function(event) {
      // Do something always
      self.updateMarkers()
      // Provide hook
      if ( self.options.onResize ) self.options.onResize(event)
    }

    this.onMarkerClick = function(event) {
      if ( self.options.onMarkerClick ) self.options.onMarkerClick(self, event)
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
      self.attachEventListener( window, 'resize', self.onResize )
      self.attachEventListener( document.querySelectorAll( '.'+self.markerClass ), 'click', self.onMarkerClick )
    }



    /**
     * Debug
     */
    this.debugMarkers = function() {
      if ( this.debug ) {
        
        // self.appendDebugStylesheet()

        // Draggable
        self.makeDraggable( self.markerClass )
      }
    }


    this.appendDebugStylesheet = function() {
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
    }

    this.makeDraggable = function(selector) {
      var draggable = document.getElementsByClassName( selector ),
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
    

    this.onBeforeInit = function(cb) {
      // Do always
      self.container.style.display = 'block'

      // Provide hook
      if ( self.options.onBeforeInit ) self.options.onBeforeInit(self, event)
    }

    this.onAfterInit = function(cb) {
      // Do always
      self.container.style.opacity = 1;
      // Provide hook
      if ( self.options.onAfterInit ) self.options.onAfterInit(self, event)
    }


    /**
     * Initialize
     */
    this.init = function() {
      self.applyRequiredStyles()
      self.detectMarkers()
      self.drawMarkers()
      self.attachEventListeners()
      self.debugMarkers()
    }

    

    this.onBeforeInit()
    this.init()
    this.onAfterInit()

  }


  var proto = Markers.prototype;


  proto.isElement = function(node) {
    try {
      return ( node.constructor.__proto__.prototype.constructor.name ) ? true : false;
    } catch (exception) {
      return false;
    }
  }

  proto._find = function( parent, elems ) {
    if ( !elems || !parent ) {
      return;
    }
    // if string, use argument as selector string
    if ( typeof elems == 'string' ) {
      elems = parent.querySelectorAll( elems );
    }
    elems = proto._makeArray( elems );
    return elems;
  };

  proto._makeArray = function( obj ) {
    var ary = [];
    if ( Array.isArray( obj ) ) {
      // use object if already an array
      ary = obj;
    } else if ( obj && typeof obj.length == 'number' ) {
      // convert nodeList to array
      for ( var i=0; i < obj.length; i++ ) {
        ary.push( obj[i] );
      }
    } else {
      // array of single index
      ary.push( obj );
    }
    return ary;
  };

  // Expose the class either via AMD, CommonJS or the global object
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return Markers;
    });
  }
  else if (typeof module === 'object' && module.exports){
    module.exports = Markers;
  }
  else {
    exports.Markers = Markers;
  }

  return Markers;
}(this || {}));