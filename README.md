Chaining validators for javascript
==================================

Why this package?
-----------------
 * Simple
 * Lightweight
 * Extensible

Usage
-----

    validate = require('./vchains.js').validate;

    console.log(
        validate('4276-8010-XXXX-5090').isCard('It is not credit card number!').error('Credit card number is valid.')
    );


Register new validation method
------------------------------

    validate = require('./vchains.js').validate;

    console.log(
        validate('My string').use('localTest', function(c, msg){
            if(this.value.indexOf(c) >= 0) return msg || 'Error in localTest!';
        }).localTest('s').error('No error :)')
    ); // Will print "Error in localTest!"

test() method is accessible only for this object.
If you want to extend validator class, you need to

Register new validation method globally
---------------------------------------

    vchains = require('./vchains.js');
    validate = vchains.validate;

    vchains.use({ 'globalTest': function(msg){
        if(this.value.indexOf(' ') >= 0) return msg || 'Value contains space!';
    }});

    console.log(
        validate('Hello, world!').globalTest().error()
    ); // Will print "Value contains space!"

Use callback for error handling
-------------------------------

    validate = require('./vchains.js').validate;
    validate('123a').onError(function(err){
      console.log(err);
    }).isNum('Not numeric string!'); // Will print "Not numeric string!"

