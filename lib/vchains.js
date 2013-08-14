var vchains = new function() {

  function ValidationError(vchain) {
    this.message = vchain._error;
  }

  ValidationError.prototype = new Error();

  // Constructor
  var V = function(value, msg){
    this._raw = this._value = value;
    this._success = msg;
    this._error = '';
  }
  // Return new chaining cleaner method
  var createCleaningMethod = function(f){
    return function(){
      this._value = f.apply(this, arguments);
      return this;
    }
  }
  // Return new chaining method which skips current validation step if this.error is already set
  var createValidationMethod = function(f){
    return function(){
      // Skip this validator if error
      this._error = this._error || f.apply(this, arguments);
      // Call error handler if error
      if(this.errorCallback && this._error) this.errorCallback.apply(this);
      return this;
    }
  }
  // Use cleaner globally (for class)
  V.cleaner = function(){
    // If called with name and function arguments
    if(typeof arguments[0] === 'string'){
      var f = arguments[1];
      this.prototype[arguments[0]] = createCleaningMethod(f);
      return;
    }
    // If called with object argument
    for(var name in arguments[0]){
      var f = arguments[0][name];
      this.prototype[name] = createCleaningMethod(f);
    }
  }
  // Use validators globally (for class)
  V.validator = function(){
    // If called with name and function arguments
    if(typeof arguments[0] === 'string'){
      var f = arguments[1];
      this.prototype[arguments[0]] = createValidationMethod(f);
      return;
    }
    // If called with object argument
    for(var name in arguments[0]){
      var f = arguments[0][name];
      this.prototype[name] = createValidationMethod(f);
    }
  }
  // Apply given function to this object
  V.prototype.inline = function(f){
    return f.apply(this);
  }
  // Use cleaner f locally (for this object)
  V.prototype.cleaner = function(name, f, global){
    this[name] = createCleaningMethod(f, arguments);
    // Validator will be accessible from new oject instances
    if(global) V.prototype[name] = this[name];
    return this;
  }
  // Use validator f locally (for this object)
  V.prototype.validator = function(name, f, global){
    this[name] = createValidationMethod(f, arguments);
    // Validator will be accessible from new oject instances
    if(global) V.prototype[name] = this[name];
    return this;
  }
  // Return validation message
  V.prototype.msg = function(){
    return this._error || this._success || '';
  }
  // Return validation error if any
  V.prototype.err = function(){
    return this._error || '';
  }
  // Return value
  V.prototype.val = function(){
    return this._value;
  }
  // Return raw value
  V.prototype.raw = function(){
    return this._raw;
  }
  // Return all properties in JSON object
  V.prototype.json = function(){
    return { raw: this._raw, val: this._value, msg: this.msg(), err: this.err() };
  }
  // Set error callback
  V.prototype.onError = function(cb){
    this.errorCallback = cb;
    return this;
  }
  // Raise exception if validation error
  V.prototype.raise = function(){
    if(this._error) throw new ValidationError(this);
  }

  // --- Validation methods --- //

  // Always return error (for test or education purpose)
  V.validator('invalid', function(msg){
    return msg || 'Error';
  });
  // Match regexp
  V.validator('is', function(regexp, msg){
    if(!this._value.match(regexp))
    return msg || 'Bad value';
  });
  // Not match regexp
  V.validator('not', function(regexp, msg){
    if(this._value.match(regexp))
    return msg || 'Bad value';
  });
  // Empty
  V.validator('isEmpty', function(msg){
    if(this._value !== '')
    return msg || 'Not empty value';
  });
  // Not empty
  V.validator('notEmpty', function(msg){
    if(this._value === '')
    return msg || 'Empty value';
  });
  // Email
  V.validator('isEmail', function(msg){
    if(!this._value.match(/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/))
    return msg || 'Bad email';
  });
  // URL
  V.validator('isUrl', function(msg){
    if(!(this._value.match(/^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?(localhost|(?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,="'\(\)_\*]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/i) || this._value.length > 2083))
    return msg || 'Bad URL';
  });
  // IP
  V.validator('isIp', function(msg){
    if(!this._value.match(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))
    return msg || 'Bad IP';
  });
  // Numeric
  V.validator('isNum', function(msg){
    if(!(typeof this._value === 'string' && this._value.match(/^-?[0-9]+$/)))
    return msg || 'Bad numeric string';
  });
  // Alpha
  V.validator('isAlpha', function(msg){
    if(!this._value.match(/^[a-zA-Z]+$/))
    return msg || 'Bad alpha string';
  });
  // Alphanumeric
  V.validator('isAlphanum', function(msg){
    if(!this._value.match(/^[a-zA-Z0-9]+$/))
    return msg || 'Bad alphanumeric string';
  });
  // Int
  V.validator('isInt', function(msg){
    var f = parseFloat(this._value);
    var i = parseInt(this._value, 10);
    if(isNaN(i) || (f != i))
    return msg || 'Bad int value';
  });
  // Float
  V.validator('isFloat', function(msg){
    if(this._value === '' || !this._value.match(/^(?:-?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/))
    return msg || 'Bad float value';
  });
  // Less
  V.validator('isLt', function(n, msg){
    var f = parseFloat(this._value);
    if(isNaN(f) || f >= n)
    return msg || 'Value too small'; // !!!
  });
  // Less or Equal
  V.validator('isLE', function(n, msg){
    var f = parseFloat(this._value);
    if(isNaN(f) || f > n)
    return msg || 'Value too small';
  });
  // Greater
  V.validator('isGt', function(n, msg){
    var f = parseFloat(this._value);
    if(isNaN(f) || f <= n)
    return msg || 'Value too big';
  });
  // Greater or Equal
  V.validator('isGE', function(n, msg){
    var f = parseFloat(this._value);
    if(isNaN(f) || f < n)
    return msg || 'Value too big';
  });
  //
  V.validator('isLen', function(min, max, msg){
    if(this._value.length < min || (max !== undefined && this._value.length > max))
    return msg || 'String length not in given range';
  });
  // Equal
  V.validator('isEq', function(value, msg){
    if(this._value != value)
    return msg || 'Values not equal';
  });
  // In list
  V.validator('isIn', function(options, msg){
    if(options.indexOf(this._value) === -1)
    return msg || 'Bad value';
  });
  // Not in list
  V.validator('notIn', function(options, msg){
    if(options.indexOf(this._value) !== -1)
    return msg || 'Bad value';
  });

  // Credit card
  V.validator('isCard', function(msg){
    var n = this._value.replace(/[^0-9]+/g, ''); // Filter digits
    if(n.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) {
      // Doing Luhn check
      var k, s = 0, x2 = false;
      for(var i = n.length - 1; i >= 0; i--){
        k = parseInt(n[i], 10);
        if(x2) k *= 2;
        s += k >= 10 ? k%10 + 1 : k;
        x2 = !x2;
      }
      if(!(s%10)) return;
    }
    return msg || 'Bad credit card number';
  });
  /*
  //
  V.validator('is', function(msg){
    return msg || '';
  });
  */

  // --- Cleaning methods --- //

  // Trim given string
  V.cleaner('trim', function(){
    return typeof this._value === 'string' ? this._value.trim() : this._value;
  });

  // Validation exception
  this.ValidationError = ValidationError;

  // Return chainable validator object
  this.create = function(value, msg){
    return new V(value, msg)
  }
  // Add new method to library
  this.extend = function(name, f){
    V.prototype[name] = f;
  }
  // Add new validation method to library
  this.validator = function(name, f){
    V.validator(name, f);
  }
  // Add new cleaning method to library
  this.cleaner = function(name, f){
    V.cleaner(name, f);
  }
} // End of vchains namespace

// Exports vchains as node.js module
if(typeof module.exports === 'object') module.exports = vchains;
