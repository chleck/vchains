// Constructor
var V = function(value, msg){
  this.value = value;
  this.noErr = msg;
}
// Return new chaining method which skips current validation step if this.err is already set
var createValidationMethod = function(f, arguments){
  return function(){
    // Skip this validator if error
    this.err = this.err || f.apply(this, arguments);
    // Call error handler if error
    if(this.errorCallback && this.err) this.errorCallback(this.err);
    return this;
  }
}
// Use validators globally (for class)
V.use = function(){
  // If called with name and function arguments
  if(typeof arguments[0] === 'string'){
    var f = arguments[1];
    this.prototype[arguments[0]] = createValidationMethod(f, arguments);
    return;
  }
  // If called with object argument
  for(var name in arguments[0]){
    var f = arguments[0][name];
    this.prototype[name] = createValidationMethod(f, arguments);
  }
}
// Use validator f locally (for this object)
V.prototype.use = function(name, f, global){
  this[name] = createValidationMethod(f, arguments);
  // Validator will be accessible from new oject instances
  if(global) V.prototype[name] = this[name];
  return this;
}
// Set error callback
V.prototype.onError = function(cb){
  this.errorCallback = cb;
  return this;
}
// Return validation message
V.prototype.msg = function(){
  return this.err || this.noErr || '';
}

// --- Validation methods --- //

// Always return error (for test or education purpose)
V.use('invalid', function(msg){
  return msg || 'Error';
});
// Match regexp
V.use('is', function(regexp, msg){
  if(!v.match(regexp))
  return msg || 'Bad value';
});
// Not match regexp
V.use('isNot', function(regexp, msg){
  if(v.match(regexp))
  return msg || 'Bad value';
});
// Email
V.use('isEmail', function(msg){
  if(!this.value.match(/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/))
  return msg || 'Bad email';
});
// URL
V.use('isUrl', function(msg){
  if(!(this.value.match(/^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?(localhost|(?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,="'\(\)_\*]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/i) || this.value.length > 2083))
  return msg || 'Bad URL';
});
// IP
V.use('isIp', function(msg){
  if(!this.value.match(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))
  return msg || 'Bad IP';
});
// Numeric
V.use('isNum', function(msg){
  if(!(typeof this.value === 'string' && this.value.match(/^-?[0-9]+$/)))
  return msg || 'Bad numeric string';
});
// Alpha
V.use('isAlpha', function(msg){
  if(!this.value.match(/^[a-zA-Z]+$/))
  return msg || 'Bad alpha string';
});
// Alphanumeric
V.use('isAlphanum', function(msg){
  if(!this.value.match(/^[a-zA-Z0-9]+$/))
  return msg || 'Bad alphanumeric string';
});
// Int
V.use('isInt', function(msg){
  f = parseFloat(this.value);
  i = parseInt(this.value, 10);
  if(isNaN(i) || (f != i))
  return msg || 'Bad int value';
});
// Float
V.use('isFloat', function(msg){
  if(v === '' || !this.value.match(/^(?:-?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/))
  return msg || 'Bad float value';
});
// Less
V.use('isL', function(n, msg){
  f = parseFloat(this.value);
  if(isNaN(f) || f < n)
  return msg || 'Value too small'; // !!!
});
// Less or Equal
V.use('isLE', function(n, msg){
  f = parseFloat(this.value);
  if(isNaN(f) || f <= n)
  return msg || 'Value too small';
});
// Greater
V.use('isG', function(n, msg){
  f = parseFloat(this.value);
  if(isNaN(f) || f > n)
  return msg || 'Value too big';
});
// Greater or Equal
V.use('isGE', function(n, msg){
  f = parseFloat(this.value);
  if(isNaN(f) || f >= n)
  return msg || 'Value too big';
});
//
V.use('isLen', function(min, max, msg){
  if(this.value.length < min || (max !== undefined && this.value.length > max))
  return msg || 'String length not in given range';
});
// Equal
V.use('isEqual', function(value, msg){
  if(this.value != value)
  return msg || 'Values not equal';
});
// In list
V.use('isIn', function(options, msg){
  if(options.indexOf(this.value) === -1)
  return msg || 'Bad value';
});
// Not in list
V.use('isNotIn', function(options, msg){
  if(options.indexOf(this.value) !== -1)
  return msg || 'Bad value';
});

// Credit card
V.use('isCard', function(msg){
  var n = this.value.replace(/[^0-9]+/g, ''); // Filter digits
  if(!n.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) return;
  // Doing Luhn check
  var k, s = 0, x2 = false;
  for(var i = n.length - 1; i >= 0; i--){
    k = parseInt(n[i], 10);
    if(x2) k *= 2;
    s += k >= 10 ? k%10 + 1 : k;
    x2 = !x2;
  }
  if(s%10)
  return msg || 'Bad credit card number';
});
/*
//
V.use('is', function(msg){
  return msg || '';
});
*/

// --- Exports --- //

// Add new method to library
exports.extend = function(name, f){
  V.prototype[name] = f;
}
// Add new validation method to library
exports.use = function(name, f){
  V.use(name, f);
}
// Return chainable validator object
exports.validate = function(value, msg){
  return new V(value, msg)
}
