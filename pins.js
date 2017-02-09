;(function (exports) {
  'use strict';

  function Pins(options) {  
    var self = this;

    /**
     * Default Options
     * @type {Object}
     */
    this.options        = options || {};
    this.debug          = self.options.debug || false;
    this.selector       = self.options.selector || null;
    this.pinClass       = self.options.pinClass || 'pin';
    this.pins           = self.options.pins || [];
    this.positionMethod = self.options.positionMethod || 'px';
    this.draggable      = self.options.draggable || false;

    this.container = document.querySelectorAll(self.selector).length ? document.querySelectorAll(self.selector)[0] : false;
    
    /**
     * applyInlineStyles
     *
     * @param node
     * @param styles
     * @returns {undefined}
     */
    this.applyInlineStyles = function(node, styles) {
      var styles = styles || {}

      var elems = self._nodeArr(node)
      
      for ( var i=0; i<elems.length; i++ ) {
        for ( var p in styles ) {
          // console.log(p, styles[p])
          elems[i].style[p] = styles[p] 
        }
      }
 
    }
  
    /**
     * applyRequiredStyles
     *
     * @returns {undefined}
     */
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

    this.requiredPinStyles = function() {
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

    this.detectPins = function() {
      var pins = self._find( self.container, document.getElementsByClassName( self.pinClass ))
      
      if ( !pins ) return false;

      for ( var i=0; i<pins.length; i++) {
        var data = pins[i].getAttribute('data-pin')
        if ( data ) {
          var pin = JSON.parse(data)
          self.pins.push(pin)
          pins[i].parentNode.removeChild(pins[i])
        } else {
          throw new Error('detectPins(): no data-pin attribute found')
        }
      }
    }


    /**
     * Draw Pins
     * Draw the pins on the screen. Runs only once, then refer to updatePins()
     */
    this.drawPins = function() {

      for ( var i=0; i<self.pins.length; i++ ) {

        var m = self.pins[i];

        // position pins
        var pin = document.createElement('div')
            pin.className = self.pinClass;

        // Apply required pin styles
        self.applyInlineStyles( pin, self.requiredPinStyles() )

        // Apply custom properties
        if ( m.props ) {  
          for ( var prop in m.props ) {
            pin.setAttribute(prop, m.props[prop])
          }
        }

        if ( self.positionMethod === 'px') {
          // get pin coords
          var x = self.convertPercentToPx( m.x, self.getContainerDimensions().width )
          var y = self.convertPercentToPx( m.y, self.getContainerDimensions().height )

          // Set coords
          pin.style.left = x+'px'
          pin.style.top = y+'px'
        }
        if ( self.positionMethod === 'percent' ) {
          // Set coords
          pin.style.left = parseFloat(m.x*100)+'%'
          pin.style.top = parseFloat(m.y*100)+'%' 
        }

        // Append to DOM
        self.container.appendChild(pin)
      }
    }

    /**
     * Update Pins
     */
    this.updatePins = function() {
      var pins = self.container.querySelectorAll( '.'+self.pinClass )

      for ( var i=0; i<pins.length; i++ ) {
        var m = self.pins[i]

        var pin = pins[i]

        if ( self.positionMethod === 'px') {
          // get pin coords
          var x = self.convertPercentToPx( m.x, self.getContainerDimensions().width )
          var y = self.convertPercentToPx( m.y, self.getContainerDimensions().height )

          // Set coords
          pin.style.left = x+'px'
          pin.style.top = y+'px'
        }
        if ( self.positionMethod === 'percent' ) {
          // Set coords
          pin.style.left = parseFloat(m[i].x*100)+'%'
          pin.style.top = parseFloat(m[i].y*100)+'%' 
        }
      }
    }




    this.onResize = function(event) {
      // Do something always
      self.updatePins()
      // Provide hook
      if ( self.options.onResize ) self.options.onResize(event)
    }

    this.onPinClick = function(event) {
      if ( self.options.onPinClick ) self.options.onPinClick(self, event)
    }

    // Attach event listeners
    this.attachEventListener = function(item, type, func) {
      if ( typeof item !== "undefined" ) {
        if ( item.length > 0 ) {
          for ( var i=0; i<item.length; i++ ) {
            item[i].addEventListener(type, func)
          }
        } else {
          item.addEventListener(type, func, false)
        }
      }
      
    }

    this.attachEventListeners = function() {
      self.attachEventListener( window, 'resize', self.onResize )
      self.attachEventListener( document.querySelectorAll( '.'+self.pinClass ), 'click', self.onPinClick )
    }



    /**
     * Debug
     */
    this.debugPins = function() {
      if ( this.debug ) {
        
        // self.appendDebugStylesheet()

        // Draggable
        self.makeDraggable( self.pinClass )
      }
    }


    this.appendDebugStylesheet = function() {
      var debugStyles = document.createElement('style')
          debugStyles.type = 'text/css'

      var css = ' \
        .map { border: 1px solid cyan; } \
        .pin { background-color: red; width: 10px; height: 10px; } \
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
    
    this.validOptions = function() {
      if ( !self.container ) {
        console.warn('Element with selector "' + this.selector + '" does not exist')
        return false
      }
      if ( !this.selector ) {
        console.warn('Pins(): Must provide a selector')
        return false;
      }
      return true;
    }

    /**
     * onBeforeInit
     * Hook provided before initialization 
     * 
     * @param  {Function} cb [description]
     */
    this.onBeforeInit = function(cb) {
      // Do awlays
      
      // Provide hook
      if ( self.options.onBeforeInit ) self.options.onBeforeInit(self, event)

      if ( cb ) cb()
    }

    /**
     * onAfterInit
     * Hook provided after initialization
     * 
     * @param  {Function} cb 
     */
    this.onAfterInit = function(cb) {
      // Do always
      self.container.style.opacity = 1;

      // Provide hook
      if ( self.options.onAfterInit ) self.options.onAfterInit(self, event)

      if ( cb ) cb()
    }


    /**
     * Init
     * @param  {Function} cb [callback]
     */
    this.init = function(cb) {

      self.applyRequiredStyles()
      self.detectPins()
      self.drawPins()
      self.attachEventListeners()
      self.debugPins()

      // Provide hook
      if ( self.options.onInit ) self.options.onInit(self, event)

      if ( cb ) cb()
    }

    if ( self.validOptions() ) {
      self.onBeforeInit(function() {
        self.init(function() {
          self.onAfterInit()
        })
      })
    }
    

  }
 


  var proto = Pins.prototype;
  
  proto.getImageSize = function( node ) {

    var wait = setInterval(function() {
      var w = node.naturalWidth,
          h = node.naturalHeight;
      if (w && h) {
        clearInterval(wait);
        callback.apply(this, [w, h]);
      }
    }, 30);
  }

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


  proto._nodeArr = function(node) {
    if ( !!Object.prototype.toString.call(node).match(/NodeList/) ) {
      return node
    } else if ( !!Object.prototype.toString.call(node).match(/HTMLCollection/) ) {
      return node
    } else if ( !!Object.prototype.toString.call(node).match(/HTMLDivElement/) ) {
      return [node]
    } else if ( Array.isArray(node) )  {
      return node
    } else {
      throw new Error('applyInlineStyles(): First param must be a NodeList, HTMLCollection, or HTMLDivElement')
    }
  }


  // Expose the class either via AMD, CommonJS or the global object
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return Pins;
    });
  }
  else if (typeof module === 'object' && module.exports){
    module.exports = Pins;
  }
  else {
    exports.Pins = Pins;
  }

  
}(this || {}));
