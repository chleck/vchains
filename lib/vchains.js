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

  // Encode HTML entities ('&' -> '&amp;' etc.)
  V.cleaner('entityEncode', function(){
    var res = this._value.replace(/&/g, '&amp;');
    //IE doesn't accept &apos;
    res = res.replace(/'/g, '&#39;');
    //Encode entities
    for(var e in entities) {
        res = res.replace(new RegExp(entities[e], 'g'), e);
    }
    return res;
  });

  // Decode HTML entities ('&amp;' -> '&' etc.)
  V.cleaner('entityDecode', function(){
    if(!~this._value.indexOf('&')) return this._value;
    var res = this._value;
    //Decode literal entities
    for(var e in entities) {
      res = res.replace(new RegExp(e, 'g'), entities[e]);
    }
    //Decode hex entities
    res = res.replace(/&#x(0*[0-9a-f]{2,5});?/gi, function (match, code) {
       return String.fromCharCode(parseInt(+code, 16));
    });
    //Decode numeric entities
    res = res.replace(/&#([0-9]{2,4});?/gi, function (match, code) {
      return String.fromCharCode(+code);
    });
    return res.replace(/&amp;/g, '&');
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

  // List of HTML entities to encode/decode
  var entities = {
    '&AElig;':    '\u00c6',
    '&Aacute;':   '\u00c1',
    '&Acirc;':    '\u00c2',
    '&Agrave;':   '\u00c0',
    '&Alpha;':    '\u0391',
    '&Aring;':    '\u00c5',
    '&Atilde;':   '\u00c3',
    '&Auml;':     '\u00c4',
    '&Beta;':     '\u0392',
    '&Ccedil;':   '\u00c7',
    '&Chi;':      '\u03a7',
    '&Dagger;':   '\u2021',
    '&Delta;':    '\u0394',
    '&ETH;':      '\u00d0',
    '&Eacute;':   '\u00c9',
    '&Ecirc;':    '\u00ca',
    '&Egrave;':   '\u00c8',
    '&Epsilon;':  '\u0395',
    '&Eta;':      '\u0397',
    '&Euml;':     '\u00cb',
    '&Gamma;':    '\u0393',
    '&Iacute;':   '\u00cd',
    '&Icirc;':    '\u00ce',
    '&Igrave;':   '\u00cc',
    '&Iota;':     '\u0399',
    '&Iuml;':     '\u00cf',
    '&Kappa;':    '\u039a',
    '&Lambda;':   '\u039b',
    '&Mu;':       '\u039c',
    '&Ntilde;':   '\u00d1',
    '&Nu;':       '\u039d',
    '&OElig;':    '\u0152',
    '&Oacute;':   '\u00d3',
    '&Ocirc;':    '\u00d4',
    '&Ograve;':   '\u00d2',
    '&Omega;':    '\u03a9',
    '&Omicron;':  '\u039f',
    '&Oslash;':   '\u00d8',
    '&Otilde;':   '\u00d5',
    '&Ouml;':     '\u00d6',
    '&Phi;':      '\u03a6',
    '&Pi;':       '\u03a0',
    '&Prime;':    '\u2033',
    '&Psi;':      '\u03a8',
    '&Rho;':      '\u03a1',
    '&Scaron;':   '\u0160',
    '&Sigma;':    '\u03a3',
    '&THORN;':    '\u00de',
    '&Tau;':      '\u03a4',
    '&Theta;':    '\u0398',
    '&Uacute;':   '\u00da',
    '&Ucirc;':    '\u00db',
    '&Ugrave;':   '\u00d9',
    '&Upsilon;':  '\u03a5',
    '&Uuml;':     '\u00dc',
    '&Xi;':       '\u039e',
    '&Yacute;':   '\u00dd',
    '&Yuml;':     '\u0178',
    '&Zeta;':     '\u0396',
    '&aacute;':   '\u00e1',
    '&acirc;':    '\u00e2',
    '&acute;':    '\u017d',
    '&aelig;':    '\u00e6',
    '&agrave;':   '\u00e0',
    '&alefsym;':  '\u2135',
    '&alpha;':    '\u03b1',
    '&and;':      '\u2227',
    '&ang;':      '\u2220',
    '&apos;':     '\u0027',
    '&aring;':    '\u00e5',
    '&asymp;':    '\u2248',
    '&atilde;':   '\u00e3',
    '&auml;':     '\u00e4',
    '&bdquo;':    '\u201e',
    '&beta;':     '\u03b2',
    '&brvbar;':   '\u0160',
    '&bull;':     '\u2022',
    '&cap;':      '\u2229',
    '&ccedil;':   '\u00e7',
    '&cedil;':    '\u017e',
    '&cent;':     '\u00a2',
    '&chi;':      '\u03c7',
    '&circ;':     '\u02c6',
    '&clubs;':    '\u2663',
    '&cong;':     '\u2245',
    '&copy;':     '\u00a9',
    '&crarr;':    '\u21b5',
    '&cup;':      '\u222a',
    '&dArr;':     '\u21d3',
    '&dagger;':   '\u2020',
    '&darr;':     '\u2193',
    '&deg;':      '\u00b0',
    '&delta;':    '\u03b4',
    '&diams;':    '\u2666',
    '&divide;':   '\u00f7',
    '&eacute;':   '\u00e9',
    '&ecirc;':    '\u00ea',
    '&egrave;':   '\u00e8',
    '&empty;':    '\u2205',
    '&emsp;':     '\u2003',
    '&ensp;':     '\u2002',
    '&epsilon;':  '\u03b5',
    '&equiv;':    '\u2261',
    '&eta;':      '\u03b7',
    '&eth;':      '\u00f0',
    '&euml;':     '\u00eb',
    '&euro;':     '\u20ac',
    '&exist;':    '\u2203',
    '&fnof;':     '\u0192',
    '&forall;':   '\u2200',
    '&frac12;':   '\u00bd',
    '&frac14;':   '\u0152',
    '&frac34;':   '\u0178',
    '&frasl;':    '\u2044',
    '&gamma;':    '\u03b3',
    '&ge;':       '\u2265',
    '&gt;':       '\u003e',
    '&hArr;':     '\u21d4',
    '&harr;':     '\u2194',
    '&hearts;':   '\u2665',
    '&hellip;':   '\u2026',
    '&iacute;':   '\u00ed',
    '&icirc;':    '\u00ee',
    '&iexcl;':    '\u00a1',
    '&igrave;':   '\u00ec',
    '&image;':    '\u2111',
    '&infin;':    '\u221e',
    '&int;':      '\u222b',
    '&iota;':     '\u03b9',
    '&iquest;':   '\u00bf',
    '&isin;':     '\u2208',
    '&iuml;':     '\u00ef',
    '&kappa;':    '\u03ba',
    '&lArr;':     '\u21d0',
    '&lambda;':   '\u03bb',
    '&lang;':     '\u2329',
    '&laquo;':    '\u00ab',
    '&larr;':     '\u2190',
    '&lceil;':    '\u2308',
    '&ldquo;':    '\u201c',
    '&le;':       '\u2264',
    '&lfloor;':   '\u230a',
    '&lowast;':   '\u2217',
    '&loz;':      '\u25ca',
    '&lrm;':      '\u200e',
    '&lsaquo;':   '\u2039',
    '&lsquo;':    '\u2018',
    '&lt;':       '\u003c',
    '&macr;':     '\u00af',
    '&mdash;':    '\u2014',
    '&micro;':    '\u00b5',
    '&middot;':   '\u00b7',
    '&minus;':    '\u2212',
    '&mu;':       '\u03bc',
    '&nabla;':    '\u2207',
    '&nbsp;':     '\u00a0',
    '&ndash;':    '\u2013',
    '&ne;':       '\u2260',
    '&ni;':       '\u220b',
    '&not;':      '\u00ac',
    '&notin;':    '\u2209',
    '&nsub;':     '\u2284',
    '&ntilde;':   '\u00f1',
    '&nu;':       '\u03bd',
    '&oacute;':   '\u00f3',
    '&ocirc;':    '\u00f4',
    '&oelig;':    '\u0153',
    '&ograve;':   '\u00f2',
    '&oline;':    '\u203e',
    '&omega;':    '\u03c9',
    '&omicron;':  '\u03bf',
    '&oplus;':    '\u2295',
    '&or;':       '\u2228',
    '&ordf;':     '\u00aa',
    '&ordm;':     '\u00ba',
    '&oslash;':   '\u00f8',
    '&otilde;':   '\u00f5',
    '&otimes;':   '\u2297',
    '&ouml;':     '\u00f6',
    '&para;':     '\u00b6',
    '&part;':     '\u2202',
    '&permil;':   '\u2030',
    '&perp;':     '\u22a5',
    '&phi;':      '\u03c6',
    '&pi;':       '\u03c0',
    '&piv;':      '\u03d6',
    '&plusmn;':   '\u00b1',
    '&pound;':    '\u00a3',
    '&prime;':    '\u2032',
    '&prod;':     '\u220f',
    '&prop;':     '\u221d',
    '&psi;':      '\u03c8',
    '&quot;':     '\u0022',
    '&rArr;':     '\u21d2',
    '&radic;':    '\u221a',
    '&rang;':     '\u232a',
    '&raquo;':    '\u00bb',
    '&rarr;':     '\u2192',
    '&rceil;':    '\u2309',
    '&rdquo;':    '\u201d',
    '&real;':     '\u211c',
    '&reg;':      '\u00ae',
    '&rfloor;':   '\u230b',
    '&rho;':      '\u03c1',
    '&rlm;':      '\u200f',
    '&rsaquo;':   '\u203a',
    '&rsquo;':    '\u2019',
    '&sbquo;':    '\u201a',
    '&scaron;':   '\u0161',
    '&sdot;':     '\u22c5',
    '&sect;':     '\u00a7',
    '&shy;':      '\u00ad',
    '&sigma;':    '\u03c3',
    '&sigmaf;':   '\u03c2',
    '&sim;':      '\u223c',
    '&spades;':   '\u2660',
    '&sub;':      '\u2282',
    '&sube;':     '\u2286',
    '&sum;':      '\u2211',
    '&sup1;':     '\u00b9',
    '&sup2;':     '\u00b2',
    '&sup3;':     '\u00b3',
    '&sup;':      '\u2283',
    '&supe;':     '\u2287',
    '&szlig;':    '\u00df',
    '&tau;':      '\u03c4',
    '&there4;':   '\u2234',
    '&theta;':    '\u03b8',
    '&thetasym;': '\u03d1',
    '&thinsp;':   '\u2009',
    '&thorn;':    '\u00fe',
    '&tilde;':    '\u02dc',
    '&times;':    '\u00d7',
    '&trade;':    '\u2122',
    '&uArr;':     '\u21d1',
    '&uacute;':   '\u00fa',
    '&uarr;':     '\u2191',
    '&ucirc;':    '\u00fb',
    '&ugrave;':   '\u00f9',
    '&uml;':      '\u0161',
    '&upsih;':    '\u03d2',
    '&upsilon;':  '\u03c5',
    '&uuml;':     '\u00fc',
    '&weierp;':   '\u2118',
    '&xi;':       '\u03be',
    '&yacute;':   '\u00fd',
    '&yen;':      '\u00a5',
    '&yuml;':     '\u00ff',
    '&zeta;':     '\u03b6',
    '&zwj;':      '\u200d',
    '&zwnj;':     '\u200c',
  };

} // End of vchains namespace

// Exports vchains as node.js module
if(typeof module.exports === 'object') module.exports = vchains;
