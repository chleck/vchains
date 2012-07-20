# Chaining validators for javascript

## Why this package?
 * Simple
 * Lightweight
 * Extensible

## Usage

```javascript
validate = require('./vchains.js').validate;

console.log(
  validate('4276-8010-XXXX-5090').isCard('It is not credit card number!').error('Credit card number is valid.')
);
```

## Register new validation method

```javascript
validate = require('./vchains.js').validate;

console.log(
  validate('My string').use('localTest', function(c, msg){
    if(this.value.indexOf(c) >= 0) return msg || 'Error in localTest!';
  }).localTest('s').error('No error :)')
); // Will print "Error in localTest!"
```

test() method is accessible only for this object.
If you want to extend validator class, you need to

## Register new validation method globally

### Single method of a library function

```javascript
vchains = require('./vchains.js');
validate = vchains.validate;

vchains.use('globalTest': function(msg){
  if(this.value.indexOf(' ') >= 0) return msg || 'Value contains space!';
});

console.log(
  validate('Hello, world!').globalTest().error()
); // Will print "Value contains space!"
```

### Multiple methods of a library function

```javascript
vchains = require('./vchains.js');
validate = vchains.validate;

vchains.use({
  'globalTest1': function(msg){
    if(this.value.indexOf(' ') >= 0) return msg || 'Value contains space!';
  },
  'globalTest2': function(msg){
    if(this.value.indexOf('#') >= 0) return msg || 'Value contains "#"!';
  }
});

console.log(
  validate('Hello, world! #1').globalTest1().error(),
  ', ',
  validate('Hello, world! #2').globalTest2().error()
); // Will print "Value contains space!, Value contains "#"!"
```

### Single method of a validator instance

```javascript
validate = require('./vchains.js').validate;

console.log(
  validate('My string').use('localTest', function(c, msg){
    if(this.value.indexOf(c) >= 0) return msg || 'Error in localTest!';
  }, true /* !!! */).localTest('s').error('No error :)'),
  ', ',
  validate('Other string').localTest('A').error('This string does not contains "A".')
); // Will print "Error in localTest!, This string does not contains "A"."
```

## Use callback for error handling

```javascript
validate = require('./vchains.js').validate;
validate('123a').onError(function(err){
  console.log(err);
}).isNum('Not numeric string!'); // Will print "Not numeric string!"
```
