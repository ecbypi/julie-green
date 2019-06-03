// Borrowed and adapted from Backbone.js
//
// https://backbonejs.org
// https://github.com/jashkenas/backbone/blob/1.4.0/backbone.js#L8-L34
(function(factory) {

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = typeof self == 'object' && self.self === self && self ||
            typeof global == 'object' && global.global === global && global;

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(function(exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.JulieGreen = factory(root);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    factory(root);

  // Finally, as a browser global.
  } else {
    root.JulieGreen = factory(root);
  }

})(function(root) {
  function JulieGreen(formElement) {
    this.form = formElement;
    this.inputs = formElement.inputs;
  }

  return JulieGreen;
});
