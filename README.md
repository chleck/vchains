# Chaining validators for javascript

## Why this package?
 * Simple
 * Lightweight
 * Extensible

## Usage

```javascript
validate = require('vchains').validate;

console.log(
  validate('4276-8010-XXXX-5090', 'Credit card number is valid.').isCard('It is not credit card number!').msg()
); // Will print "Credit card number is valid."
```

## Register new validation methods

If you need custom validation method, your can extend vchains.

Call vchains.use() with your validation method as parameter. After that you can access you method from any validation object instance.

### Single method

```javascript
vchains = require('vchains');
validate = vchains.validate;

vchains.use('globalTest', function(msg){
  if(this.value.indexOf(' ') >= 0) return msg || 'Value contains space!';
});

console.log(
  validate('Hello, world!').globalTest().msg()
); // Will print "Value contains space!"
```

### Multiple methods

You can register multiple custom validators at once.

```javascript
vchains = require('vchains');
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
  validate('Hello, world! #1').globalTest1().msg(),
  validate('Hello, world! #2').globalTest2().msg()
); // Will print "Value contains space! Value contains "#"!"
```

### Add custom validator from validation chain

You can add custom validation method directly from validation chain.

In this case custom method will be accessible only for current validation object.

```javascript
validate = require('vchains').validate;

console.log(
  validate('My string', 'No error :)').use('localTest', function(c, msg){
    if(this.value.indexOf(c) >= 0) return msg || 'Error in localTest!';
  }).localTest('s').msg()
); // Will print "Error in localTest!"
```

If the second parameter of vchains.use() is 'true' validator will be accessible from any new validation object.

```javascript
validate = require('vchains').validate;

console.log(
  validate('My string', 'No error :)').use('globalTest', function(msg){
    if(this.value.indexOf(c) >= 0) return msg || 'Error in localTest!';
  }, true /* !!! */).globalTest().msg(),
  validate('Other_string', 'This string does not contains spaces.').globalTest().msg()
); // Will print "Error in localTest! This string does not contains spaces."
```

## Passing parameters to custom validator

You can pass any number of parameters to your custom validator.

Last parameter must be an error message if validation failed.

```javascript
validate = require('vchains').validate;

console.log(
  validate('Short string', 'No error :)').use('parametersTest', function(min, max, msg){
    var l = String(this.value).length;
    if(min > l || l > max) return msg || 'Error in parametersTest!';
  }).localTest(0, 32).msg(),
); // Will print "Error in parametersTest!"
```

## Use callback for error handling

```javascript
validate = require('vchains').validate;

validate('123a').onError(function(err){
  if(err) console.log('Validation error:', err); else console.log('No error!');
}).isNum('Not numeric string!'); // Will print "Validation error: Not numeric string!"
```
