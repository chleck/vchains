vchains = require('./index.js');
validate = vchains.validate;

// Add new global validation method to library
vchains.use({ 'test1': function(msg){
  console.log('Registered globally.');
//  return msg || 'Error 1!'; // Uncomment to raise error at this point
}});

console.log(
  // Create chainable validator object,
  // add new local validation method to this oject,
  // call test and test2 validation methods,
  // raise error by invalid() method,
  // return error message
  validate('my@emailcom').use('test2', function(msg){
    console.log('Registered locally.');
//    return msg || 'Error 1!'; // Uncomment to raise error at this point
  }).use('test3', function(a, b, msg){
    console.log('Registered locally as globally. You can pass additional parameters to your validator: a="' + a + '", b="' + b + '".');
//    return msg || 'Error 3!'; // Uncomment to raise error at this point
  }, true).test1().test2('This is a custom error message.').test3('A value', 'B value').isEmail().invalid('The BIG error!').error()
);
console.log(validate('4276-8010-1016-5090').test1().test3('Value can be undefined ->').isCard('It\'s not credit card number!').error('Credit card number is valid.'));
console.log(validate('4275-8010-1016-5090').isCard('It\'s not credit card number!').error());

validate('123a').onError(function(err){
  console.log(err);
}).isNum('Not numeric string!');
