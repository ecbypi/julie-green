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
    form.addEventListener("submit", validateForm);

    gaggle[form.name] = this;
  }

  JulieGreen.prototype.findLimb = function(input) {
    return this.limbs.findByInputName(input.name);
  };

  function validateInput(event) {
    var julie = findJulie(event.target.form);
    var limb = julie.findLimb(event.target);

    if ( limb ) {
      return limb.validate();
    }
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
      var lastContext;

      while ( propertyPath.length ) {
        var pathSegment = propertyPath.shift();

        // Check the next segment to determine what this segment's value should be
        //
        // Nested properties
        // ex: signup[email] -> ["signup", "email"]
        if ( propertyPath[0] && propertyPath[0].match(/\w+/) ) {
          appendage = {};

          if ( inputsContext instanceof Array && pathSegment === "" ) {
            if ( inputsContext.length === 0 ) {
              pathSegment = 0;
            } else {
              pathSegment = inputsContext.length - 1;
            }
          }

        // Array of objects
        // ex: emergency_contacts[][name] -> ["emergency_contacts", "", "name"]
        } else if ( propertyPath[0] === "" && propertyPath[1] ) {
          appendage = [];

        // End of the path can be a property or an array
        // ex: contact_preference[] -> ["contact_preference", ""]
        } else if ( pathSegment.match(/\w+/) || propertyPath === [""] ) {
          appendage = inputsContext[pathSegment];

          if ( appendage ) {
            if ( appendage.trackInput ) {
              appendage.trackInput(input);
            } else if ( appendage && lastContext instanceof Array ) {
              inputsContext = {};
              lastContext.push(inputsContext);

              appendage = appendageFromInput(input);
            }
          } else {
            appendage = appendageFromInput(input);
          }
        // Skip if at the end of an array property
        } else if ( pathSegment === "" ) {
          continue;
        }

        if ( ! inputsContext.hasOwnProperty(pathSegment) ) {
          Object.defineProperty(inputsContext, pathSegment, { value: appendage, writable: false });
        }

        lastContext = inputsContext;
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
    var isMultiType = input.type === "checkbox" || input.type === "radio";
    var hasMultiple = input.form.elements.namedItem(input.name) instanceof RadioNodeList;

    if ( isMultiType && hasMultiple ) {
      return new DigitsAppendage(input);
    } else if ( arrayInputRegexp.test(input.name) && hasMultiple ) {
      return new MultiAppendage(input);
    } else {
      return new Appendage(input);
    }
  }

  function Appendage(input) {
    this.element = input;
    this.attributes = this.element.attributes;

    this.validators = detectValidators(this.element);

    // TODO: Setup event listeners to run validations if this input does not have a `<form>`
  }

  Appendage.prototype.value = function() {
    switch ( this.element.type ) {
      case "select-multiple":
        var value = [];
        var option;

        for ( var i = 0; i < this.element.selectedOptions; i++ ) {
          option = this.element.selectedOptions[i];
          value.push(option.value);
        }

        return value;

      default:
        return this.element.value;
    }
  };

  Appendage.prototype.validationsSourceElement = function() {
    return this.element;
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

  function detectValidators(element) {
    var validators = [];

    for ( validatorName in Validators ) {
      validator = Validators[validatorName];

      if ( validator.isCompatibleWith(element) ) {
        validators.push(validator.name);
      }
    }

    return validators;
  }

  // TODO: detecting validators for collection inputs
  function DigitsAppendage(input) {
    this.elements = [];
    this.nodeList = input.form.elements.namedItem(input.name);

    var currentElement = input;

    // NOTE: Assumes input is inside the form
    while ( currentElement.tagName.toUpperCase() !== "FORM" ) {
      if ( currentElement.tagName === "FIELDSET" ) {
        this.fieldset = currentElement;
        break;
      }

      currentElement = currentElement.parentElement;
    }

    this.trackInput(input);

    if ( this.fieldset ) {
      this.validators = detectValidators(this.fieldset);
    } else {
      this.validators = [];
    }
  }

  DigitsAppendage.prototype.value = function() {
    switch ( this.elements[0].type ) {
      case "checkbox":
        var value = [];
        var checkbox;

        for ( var i = 0; i < this.nodeList.length; i++ ) {
          checkbox = this.nodeList[i];

          if ( checkbox.checked ) {
            value.push(checkbox.value);
          }
        }

        return value;

      case "radio":
        return this.nodeList.value;
    }
  };

  DigitsAppendage.prototype.trackInput = function(input) {
    this.elements.push(input);
  };

  DigitsAppendage.prototype.validationsSourceElement = function() {
    return this.fieldset;
  };

  DigitsAppendage.prototype.validate = function() {
    return Appendage.prototype.validate.call(this);
  }

  // NOTE: `MultiAppendage` isn't meant to be a descendant of `DigitsAppendage`; we're only
  // reusing `DigitsAppendage`'s functionality
  function MultiAppendage(input) {
    DigitsAppendage.call(this, input);
  }

  MultiAppendage.prototype.value = function() {
    var value = [];
    var input;

    for ( var i = 0; i < this.elements.length; i++ ) {
      input = this.elements[i];
      value.push(input.value);
    }

    return value;
  };

  MultiAppendage.prototype.trackInput = function(input) {
    DigitsAppendage.prototype.trackInput.call(this, input);

    var inputIndex = this.elements.indexOf(input);
    var inputAppendage = new Appendage(input);

    Object.defineProperty(
      this,
      inputIndex,
      {
        value: inputAppendage,
        enumerable: false,
        writable: false
      }
    );
  };

  MultiAppendage.prototype.validationsSourceElement = function() {
    return this.fieldset;
  }

  MultiAppendage.prototype.validate = function() {
    return Appendage.prototype.validate.call(this);
  }

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
    var value = appendage.value();

    if ( appendage.constructor === MultiAppendage ) {
      var allEmpty = true;

      for ( var i = 0; i < value.length; i++ ) {
        allEmpty = !!value[i];
      }

      return allEmpty;
    } else if ( value.constructor === Array ) {
      return value.length > 0;
    } else {
      return !!value;
    }
  });

  defineValidator("pattern", function(appendage, input) {
    var regexp = new RegExp(input.pattern);

    return regexp.test(appendage.value);
  });

  defineValidator("minlength", function(appendage, input) {
    var minLength = parseInt(input.minlength);

    return input.value.length >= minLength;
  });

  defineValidator("maxlength", function(appendage, input) {
    var maxLength = parseInt(input.maxlength);

    return input.value.length <= maxLength;
  });

  defineValidator("min", function(appendage, input) {
    var value = parseFloat(input.value);
    var limit = parseInt(input.min);

    return value >= limit;
  });

  defineValidator("max", function(appendage, input) {
    var value = parseFloat(input.value);
    var limit = parseInt(input.max);

    return value <= limit;
  });

  return JulieGreen;
});
