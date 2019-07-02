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
    root.Backbone = factory(root);
  }

})(function(root) {
  var forEach = Array.prototype.forEach;

  function observerCallback(mutationList, observer) {}

  function JulieGreen(form) {
    this.form = form;
    this.limbs = {};

    var julie = this;

    forEach.call(this.form.elements, function(element) {
      var nestedObjectProperties = convertInputNameToNestedObjectProperties(element.name),
          currentProperty = nestedObjectProperties.shift(),
          objectContext = julie.limbs;

      // build nested object described by `nestedObjectProperties` into `params`
      //
      // does not overwrite existing properties
      while ( nestedObjectProperties.length ) {
        // ex: organization[shipping_address] -> ["organization", "shipping_address"]
        if ( nestedObjectProperties[0].match(/\w+/) ) {
          objectContext[currentProperty] || (objectContext[currentProperty] = {});
        // ex: organization[contact_ids][] -> ["organization", "contact_ids" ""]
        } else if ( nestedObjectProperties[0] === "" ) {
          objectContext[currentProperty] ||
            (objectContext[currentProperty] = new CollectionInputProxy(julie));
        }

        objectContext = objectContext[currentProperty];
        currentProperty = nestedObjectProperties.shift() || currentProperty;
      }

      // set the value at the end of the properties path
      if ( objectContext[currentProperty] instanceof Array ) {
        objectContext[currentProperty].add(element);
      } else {
        objectContext[currentProperty] = new InputProxy(julie, element);
      }
    });

    this.observer = new MutationObserver(observerCallback);
    this.observer.observe(this.form, { attributes: true, childList: true, subtree: true });
  }

  root.JulieGreen = JulieGreen;

  function InputProxy(julie, element) {
    this.julie = julie;
    this.element = element;
    this.state = "initial";

    this.validations = detectValidations(element);

    // TODO: What about `keyup`?
    this.input.addEventListener("change", validationCallbackFactory(this));
  }

  function validationCallbackFactory(inputProxy) {
    return function(event) {
      var failedValidations = [];

      forEach.call(inputProxy.validations, function(validationName) {
      });
    }
  }

  var ValidatorsByName = {};

  function Validator(name, options, check) {
    options || (options = {});

    if ( ValidatorsByName[name] ) {
      throw new Error("`" + name + "' is already taken as a validator");
    }

    this.name = name;
    this.check = check;
    this.inputTypes = options.inputTypes || [];
    this.defaultOptions = options.defaults || {};

    ValidatorsByName[this.name] = this;
  }

  var RequiredValidator = new Validator("required", {}, function(julie, inputProxy) {
  });

  function processValidations(event) {}

  function CollectionInputProxy(julie) {
    this.julie = julie;
    this.inputs = []
  }

  function detectValidations(input) {
    if ( input.disabled || input.readOnly ) {
      // TODO: clear validations
      return;
    }

    var inputType = input.type, attributes = input.attributes;

    if ( attributes.hasOwnProperty("required") ) {
    }

    if ( attributes.hasOwnProperty("pattern") && inputType.in(patternApplicableInputTypes) ) {
    }

    if ( inputType.in(lengthApplicableInputTypes) ) {
      // TODO: quit if values are below 0
      if ( attributes.hasOwnProperty("maxlength") ) {
        // setup validations
      }

      if ( attributes.hasOwnProperty("minlength") ) {
        // setup validations
      }

      if ( maxLength.value < minLength.value ) {
        // remove validations
      }
    }

    if ( inputType.in(minMaxApplicableInputTypes) ) {
      if ( attributes.hasOwnProperty("min") {
      }

      if ( attributes.hasOwnProperty("max") {
      }

      if ( max.value < min.value ) {
        // remove validations
      }
    }
  }

  CollectionInputProxy.prototype.add = function(element) {
    this.inputs.push(element);
  }

  // Changes input name into an array of the properties the input name describes
  //
  //    "order[address][postal_code]" -> ["order", "address", "postal_code"]
  //    "contact[roles][]" -> ["contact", "roles", ""]
  //    "delivered_on" -> ["delivered_on"]
  function convertInputNameToNestedObjectProperties(inputName) {
    return inputName.replace(/]/g, "").split("[");
  }

  function mergeInputValueWithObject(params, input) {
    if ( inputIsEnabled(input) && inputHasValue(input) ) {
      var nestedObjectProperties = convertInputNameToNestedObjectProperties(input.name),
          currentProperty = nestedObjectProperties.shift(),
          objectContext = params;

      // build nested object described by `nestedObjectProperties` into `params`i
      //
      // does not overwrite existing properties
      while ( nestedObjectProperties.length ) {
        // ex: organization[shipping_address] -> ["organization", "shipping_address"]
        if ( nestedObjectProperties[0].match(/\w+/) ) {
          objectContext[currentProperty] || (objectContext[currentProperty] = {});
        // ex: organization[contact_ids][] -> ["organization", "contact_ids" ""]
        } else if ( nestedObjectProperties[0] === "" ) {
          objectContext[currentProperty] || (objectContext[currentProperty] = []);
        }

        objectContext = objectContext[currentProperty];
        currentProperty = nestedObjectProperties.shift() || currentProperty;
      }

      // set the value at the end of the properties path
      if ( objectContext[currentProperty] instanceof Array ) {
        objectContext[currentProperty].push(input.value);
      } else {
        objectContext[currentProperty] = input.value;
      }
    }

    return params;
  }


});
(function(_) {
  "use strict"

  function inputIsEnabled(input) {
    return !input.disabled;
  }

  function inputHasValue(input) {
    if ( input.type === "radio" ) {
      return input.checked;
    } else {
      return !!input.value;
    }
  }

  function queryParamsFromInputs(inputs) {
    return _.inject(inputs, mergeInputValueWithObject, {});
  }

  OpenBiome.queryParamsFromInputs = queryParamsFromInputs;
})(_);
