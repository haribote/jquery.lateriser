/**!
 * jquery.lateriser.js
 * @desc    A kind of "Lazy Load" plug-in
 * @see     {@link https://github.com/haribote/jquery.lateriser}
 * @author  KIMURA Tetsuro
 * @license The MIT License (MIT)
 */

;(function (window, $, undefined) {
  'use strict';

  /**
   * Privates
   */
  var listened     = false;
  var $window      = null;
  var collection   = [];
  var dataLazy     = 'data-lazy';
  var windowHeight = 0;
  var debounceTime = 100;

  /**
   * Styles
   */
  var hiddenStyle = {
    'opacity'   : 0,
    'filter'    : 'alpha(opacity=0);',
    'transition': 'opacity .4s ease'
  };
  var shownStyle  = {
    'opacity': 1,
    'filter' : 'alpha(opacity=1);'
  };

  /**
   * LateRiser
   * @class
   * @prop {HtmlImageElement} el
   * @prop {jQuery} $el
   * @prop {Object} options
   * @prop {Number} offsetTop
   * @prop {Number} offsetBottom
   * @prop {Boolean} ready
   */
  var LateRiser = function(el, options) {
    // properties
    this.el           = el;
    this.$el          = $(this.el);
    this.options      = options;
    this.offsetTop    = 0;
    this.offsetBottom = 0;
    this.ready        = false;

    // subscribe events
    LateRiser.initialize();

    // enable to lazy-loading
    this.on();

    // trigger events
    setTimeout(function () {
      $window.scroll();
    }, 1);
    $window.resize();
  };

  /**
   * subscribe events
   * @static
   */
  LateRiser.initialize = function () {
    // run this method just one time.
    if (listened) {
      return;
    }
    listened = true;

    // bind event handlers
    $window = $(window);
    $window.on('scroll touchmove', null, LateRiser.debounce(LateRiser.onScroll, debounceTime));
    $window.on('resize', null, LateRiser.debounce(LateRiser.onResize, debounceTime));
  };

  /**
   * event reducer
   * @static
   * @param {Function} func
   * @param {Number}   delay
   */
  LateRiser.debounce = function(func, delay) {
    var context = null;
    var args = [];
    var timer = null;
    var _func = function() {
      func.apply(context, args);
      context = null;
      args = [];
    };
    return function() {
      context = this;
      args = arguments;
      if (timer) {
        window.clearTimeout(timer);
      } else {
        _func();
      }
      timer = window.setTimeout(_func, delay);
    };
  };

  /**
   * scroll event handler
   * @static
   * @prop {Number} scrollY
   */
  LateRiser.onScroll = function () {
    // cache position of scroll
    var scrollY = LateRiser.getScrollY();

    // scan all instances
    for (var i=0, l=collection.length; i<l; i++) {
      collection[i].check(scrollY);
    }
  };

  /**
   * resize event handler
   * @static
   */
  LateRiser.onResize = function () {
    // cache height of window
    windowHeight = window.innerHeight;
  };

  /**
   * return scroll position
   * @static
   * @returns {Number}
   */
  LateRiser.getScrollY = function() {
    return (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
  };

  /**
   * enable to lazy-loading
   */
  LateRiser.prototype.on = function() {
    // set defaults
    this.el.setAttribute(dataLazy, true);
    this.offsetTop    = this.$el.offset().top || 0;
    this.offsetBottom = this.offsetTop + this.$el.height();
    this.$el.css(hiddenStyle);

    // add to collection
    collection.push(this);
  };

  /**
   * check to load image
   * @param {Number} scrollY
   * @prop {Number} windowBottom
   */
  LateRiser.prototype.check = function (scrollY) {
    // cache
    var windowBottom = scrollY + windowHeight;

    // check the position
    if (
      (
        (this.offsetTop > scrollY && this.offsetTop < windowBottom) ||
        (this.offsetBottom > scrollY && this.offsetBottom < windowBottom) ||
        (scrollY > this.offsetTop && windowBottom < this.offsetBottom)
      ) &&
      !this.ready
    ) {
      this.load();
    }
  };

  /**
   * load image and show
   */
  LateRiser.prototype.load = function() {
    // set ready flag to true
    this.ready = true;

    // load image
    var _this   = this;
    this.$el.on('load', null, function(ev) {
      // then show image
      _this.show();
    });
    this.el.src = this.el.getAttribute('data-src');
  };

  /**
   * show image
   */
  LateRiser.prototype.show = function () {
    // set shownStyle to element
    this.$el.css(shownStyle);
  };

  /**
   * LateRiser Pug-in
   */
  $.fn.lateRiser = function (options) {
    this.not('[' + dataLazy + ']').each(function (i, el) {
      return new LateRiser(el, options);
    });

    return this;
  };
})(window, jQuery);
