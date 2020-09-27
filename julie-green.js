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
  var gaggle = {};

  function findJulie(element) {
    return gaggle[element.name];
  }

  function JulieGreen(form) {
    this.limbs = new LimbsDirectory(form.elements);

    if ( !form.name ) {
      form.name = "julie-v" + Date.now();
    }

    form.addEventListener("input", validateInput);
    form.addEventListener("change", validateInput);
    form.addEventListener("submit", validateForm);

    gaggle[form.name] = this;
  }

  JulieGreen.prototype.findLimb = function(input) {
    return this.limbs.findByInputName(input.name);
  };

  JulieGreen.prototype.validate = function() {
    var result = { passed: true };

    for ( var i = 0; i < this.limbs.elements.length; i++ ) {
    }

    return result;
  };

  function validateInput(event) {
    var julie = findJulie(event.target.form);
    var limb = julie.findLimb(event.target);

    return limb.validate();
  }

  function validateForm(event) {
    var julie = findJulie(event.target);

    return julie.validate();
  }

  function LimbsDirectory(elements) {
    this.__byInputName__ = {};

    for ( var i = 0; i < elements.length; i++ ) {
      var inputsContext = this;

      var input = elements[i];
      var inputName = input.name;

      // FIXME: For now, skip the input if it doesn't have a name
      if ( ! inputName ) {
        continue;
      }

      var propertyPath = convertInputNameToObjectPropertyPathSegments(inputName);
      var appendage;

      while ( propertyPath.length ) {
        var pathSegment = propertyPath.shift();

        // Check the next value to see what to set the value to for this segment in the path
        //
        // Nested properties
        // ex: signup[email] -> ["signup", "email"]
        if ( propertyPath[0] && propertyPath[0].match(/\w+/) ) {
          appendage = {};

        // Array properties
        // ex: contact_preference[] -> ["contact_preference", ""]
        } else if ( propertyPath[0] === "" ) {
          appendage = inputsContext[pathSegment];

          if ( appendage ) {
            appendage.elements.push(input);
          } else {
            appendage = appendageFromInput(input);
          }

        // At the end of the path
        } else if ( propertyPath.length === 0 ) {
          appendage = appendageFromInput(input);
        }

        if ( ! inputsContext.hasOwnProperty(pathSegment) ) {
          Object.defineProperty(inputsContext, pathSegment, { value: appendage, writable: false });
        }

        inputsContext = inputsContext[pathSegment];
      }

      this.__byInputName__[input.name] = appendage;
    }
  }

  LimbsDirectory.prototype.findFromInput = function(input) {
    // TODO: Support inputs without a name
    var inputName = input.name;

    return this.findByInputName(inputName);
  };

  LimbsDirectory.prototype.findByInputName = function(inputName) {
    return this.__byInputName__[inputName];
  };

  // Changes input name into an array of the properties the input name describes
  //
  //    "order[address][postal_code]" -> ["order", "address", "postal_code"]
  //    "contact[roles][]" -> ["contact", "roles", ""]
  //    "delivered_on" -> ["delivered_on"]
  function convertInputNameToObjectPropertyPathSegments(inputName) {
    return inputName.replace(/]/g, "").split("[");
  }

  var arrayInputRegexp = /\[\]$/;

  function appendageFromInput(input) {
    var isMulti = input.type === "checkbox" || input.type === "radio";

    if ( input.type === "checkbox" || input.type === "radio" ) {
      return new DigitsAppendage(input);
    } else if ( arrayInputRegexp.test(input.name) ) {
      return new MultiAppendage(input);
    } else {
      return new Appendage(input);
    }
  }

  function Appendage(input) {
    this.element = input;
    this.attributes = this.element.attributes;

    this.validators = [];
    detectValidators(this);

    // TODO: Setup event listeners if this input does not have a `<form>`
  }

  Appendage.prototype.value = function() {
    return this.element.value;
  };

  Appendage.prototype.validate = function() {
    var validator;
    var result = { passed: true };

    for ( var i = 0; i < this.validators.length; i++ ) {
      validator = Validators[this.validators[i]];

      result[validator.name] = validator.check(this, this.element);

      result.passed = result.passed && result[validator.name].passed;
    }

    return result;
  };

  function detectValidators(appendage) {
    var validator;

    for ( validatorName in Validators ) {
      validator = Validators[validatorName];

      if ( validator.isCompatibleWith(appendage.element) ) {
        appendage.validators.push(validator.name);
      }
    }
  }

  // TODO: detecting validators for collection inputs
  function DigitsAppendage(input) {
    this.elements = [input];
    this.nodeList = input.form.elements.namedItem(input.name);
  }

  DigitsAppendage.prototype.value = function() {
    return this.nodeList.value;
  };

  function Validator(name, options, test) {
    this.name = name;

    if ( ! test ) {
      test = options;
      options = {};
    }

    this.test = test;
    this.htmlAttribute = options.htmlAttribute || this.name;
  }

  Validator.prototype.check = function(appendage, input) {
    var result = { name: this.name };

    result.passed = this.test(appendage, input);
    result.failed = !result.passed;

    return result;
  };

  Validator.prototype.isCompatibleWith = function(input) {
    return !input.disabled
      && !input.readonly
      && input.attributes.hasOwnProperty(this.htmlAttribute);
  };

  var Validators = {};

  function defineValidator(name, options, test) {
    Validators[name] = new Validator(name, options, test);
  }

  defineValidator("required", function(appendage, input) {
    return !!appendage.value();
  });

  defineValidator("pattern", function(appendage, input) {
    var regexp = new RegExp(input.pattern);

    return regexp.test(appendage.value);
  });

  defineValidator("minlength", function(input, julie) {
    var minLength = parseInt(input.minlength);

    return input.value.length >= minLength;
  });

  defineValidator("maxlength", function(input, julie) {
    var maxLength = parseInt(input.maxlength);

    return input.value.length <= maxLength;
  });

  defineValidator("min", function(input, julie) {
    var value = parseFloat(input.value);
    var limit = parseInt(input.min);

    return value >= limit;
  });

  defineValidator("max", function(input, julie) {
    var value = parseFloat(input.value);
    var limit = parseInt(input.max);

    return value <= limit;
  });

  return JulieGreen;
});
