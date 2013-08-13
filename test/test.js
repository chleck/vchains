vchains = require('../index.js');
validate = vchains.validate;

var v
  , good  = 'good' // Success message for validators tests
  , bad   = 'bad'; // Error message for validators tests


describe('Test suite for vchains validation library', function(){

  describe('Base:', function(){

    it('Create validation object', function(){
      v = validate();
      (typeof v).should.equal('object');
    })

    it('Extend validation object', function(){
      vchains.extend('myMethod', function(){
        return 'Me!';
      });
      validate().myMethod().should.equal('Me!');
    })

  })

  describe('Validators:', function(){

    it('invalid()', function(){
      validate('123').invalid(bad).msg().should.equal(bad);
    })

    it('is()', function(){
      validate('asdfgh', good).is(/^asd/).msg().should.equal(good);
      validate('qasdfgh').is(/^asd/, bad).msg().should.equal(bad);
    })

    it('isNot()', function(){
      validate('qasdfgh', good).isNot(/^asd/).msg().should.equal(good);
      validate('asdfgh').isNot(/^asd/, bad).msg().should.equal(bad);
    })

    it('isEmail()', function(){
      validate('asd@qwe.ru', good).isEmail().msg().should.equal(good);
      validate('asd').isEmail(bad).msg().should.equal(bad);
    })

    it('isUrl()', function(){
      validate('http://dot.net/dir/index.html?a=123&b=321', good).isUrl().msg().should.equal(good);
      validate('asd').isUrl(bad).msg().should.equal(bad);
    })

    it('isIp()', function(){
      validate('127.0.0.1', good).isIp().msg().should.equal(good);
      validate('365.1.1.1').isIp(bad).msg().should.equal(bad);
    })

    it('isNum()', function(){
      validate('-0987654321', good).isNum().msg().should.equal(good);
      validate('-').isNum(bad).msg().should.equal(bad);
    })

    it('isAlpha()', function(){
      validate('Hello', good).isAlpha().msg().should.equal(good);
      validate('asd1').isAlpha(bad).msg().should.equal(bad);
    })

    it('isAlphanum()', function(){
      validate('Hello123', good).isAlphanum().msg().should.equal(good);
      validate('Hello 123').isAlphanum(bad).msg().should.equal(bad);
    })

    it('isInt()', function(){
      validate('123', good).isInt().msg().should.equal(good);
      validate('a123').isInt(bad).msg().should.equal(bad);
    })

    it('isFloat()', function(){
      validate('-123.123E+12', good).isFloat().msg().should.equal(good);
      validate('a123').isFloat(bad).msg().should.equal(bad);
    })

    it('isLt()', function(){
      validate('123', good).isLt(124).msg().should.equal(good);
      validate('123').isLt(122, bad).msg().should.equal(bad);
    })

    it('isLE()', function(){
      validate('123', good).isLE(123).msg().should.equal(good);
      validate('123').isLE(122, bad).msg().should.equal(bad);
    })

    it('isGt()', function(){
      validate('123', good).isGt(122).msg().should.equal(good);
      validate('123').isGt(124, bad).msg().should.equal(bad);
    })

    it('isGE()', function(){
      validate('123', good).isGE(123).msg().should.equal(good);
      validate('123').isGE(124, bad).msg().should.equal(bad);
    })

    it('isLen()', function(){
      validate('123', good).isLen(0, 3).msg().should.equal(good);
      validate('123').isLen(0, 2, bad).msg().should.equal(bad);
    })

    it('isEq()', function(){
      validate('123', good).isEq(123).msg().should.equal(good);
      validate('123').isEq(' 123', bad).msg().should.equal(bad);
    })

    it('isIn()', function(){
      validate('a', good).isIn([ 'a', 'b', 'c' ]).msg().should.equal(good);
      validate('z').isIn([ 'a', 'b', 'c' ], bad).msg().should.equal(bad);
    })

    it('isNotIn()', function(){
      validate('z', good).isNotIn([ 'a', 'b', 'c' ]).msg().should.equal(good);
      validate('a').isNotIn([ 'a', 'b', 'c' ], bad).msg().should.equal(bad);
    })

    it('isCard()', function(){
      validate('4276-8010-1016-5090', good).isCard().msg().should.equal(good);
      validate('1234-5678-9011-1213').isCard(bad).msg().should.equal(bad);
    })

  })

  describe('Custom validators:', function(){

    it('Add global custom validation method', function(){
      vchains.validator('test0', function(msg){
        if(this.val().length) return msg || 'Error';
      });
    })

    it('Use this custom validation method', function(){
      validate('').test0().msg().should.equal('');
      validate(' ').test0().msg().should.equal('Error');
    })

    it('Add multiple global custom validation methods', function(){
      vchains.validator({
        'test1': function(msg){
          if(this.val().length != 1) return msg || 'Error';
        },
        'test2': function(msg){
          if(this.val().length != 2) return msg || 'Error';
        }
      });
    })

    it('Use these custom validation methods', function(){
      validate('1').test1().msg().should.equal('');
      validate('1').test2().msg().should.equal('Error');
    })

    it('Add local custom validation method from chain', function(){
      v = validate('333').validator('test3', function(msg){
        if(this.val().length != 3) return msg || 'Error';
      });
    })

    it('Use this custom validation method', function(){
      v.test3().msg().should.equal('');
    })

    it('Add global custom validation method from chain', function(){
      validate('4444').validator('test4', function(msg){
        if(this.val().length != 4) return msg || 'Error';
      }, true);
    })

    it('Use this custom validation method', function(){
      validate('4444').test4().msg().should.equal('');
    })

  })

});