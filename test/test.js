vchains = require('../index.js');
create = vchains.create;

var v
  , good  = 'good' // Success message for validators tests
  , bad   = 'bad'; // Error message for validators tests


describe('Test suite for vchains validation library', function(){

  describe('Library functions:', function(){

    it('create() - create validation object', function(){
      v = create();
      (typeof v).should.equal('object');
    })

    it('extend() - add custom method', function(){
      vchains.extend('myGlobalMethod', function(){
        return 'Me!';
      });
      create().myGlobalMethod().should.equal('Me!');
    })

    it('cleaner() - add custom cleaning method', function(){
      vchains.cleaner('myGlobalCleaner', function(n){
        return this._value.slice(n, -n);
      });
      create('asdf').myGlobalCleaner(1).val().should.equal('sd');
    })

    it('cleaner() - add multiple custom cleaning method', function(){
      vchains.cleaner({
        myGlobalCleaner1: function(){ return this._value[0]; },
        myGlobalCleaner2: function(){ return this._value[1]; }
      });
      create('asdf').myGlobalCleaner1().val().should.equal('a');
      create('asdf').myGlobalCleaner2().val().should.equal('s');
    })

    it('validator() - add custom validation method', function(){
      vchains.validator('myGlobalValidator', function(value, msg){
        if(this.val() !== value) return msg || 'myGlobalValidator: Oops!';
      });
      create(1, good).myGlobalValidator(1).msg().should.equal(good);
    })

    it('validator() - add multiple custom validation methods', function(){
      vchains.validator({
        myGlobalValidator1: function(msg){ if(this.val() !== 1) return msg || 'myGlobalValidator1: Oops!'; },
        myGlobalValidator2: function(msg){ if(this.val() !== 2) return msg || 'myGlobalValidator2: Oops!'; }
      });
      create(1, good).myGlobalValidator1().msg().should.equal(good);
      create(1).myGlobalValidator2(bad).msg().should.equal(bad);
    })

  })

  describe('vChain methods:', function(){

    it('inline() - apply given function to this chain', function(){
      create('asdf')
        .inline(function(){
          return this._value[0];
        })
        .should.equal('a');
    })

    it('cleaner() - add custom cleaning method to this chain', function(){
      create('asdf')
        .cleaner('myCleaner', function(n){
          return this._value.slice(n, -n);
        })
        .myCleaner(1).val().should.equal('sd');
    })

    it('cleaner() - add global custom cleaning method from chain', function(){
      create()
        .cleaner('myGlobalCleanerFromChain', function(n){
          return this._value.slice(n);
        }, true)
      create('asdf').myGlobalCleanerFromChain(1).val().should.equal('sdf');
    })

    it('validator() - add custom validation method to this chain', function(){
      create(1, good)
        .validator('myValidator', function(value, msg){
          if(this.val() !== value) return msg || 'myValidator: Oops!';
        })
        .myValidator(1).msg().should.equal(good);
    })

    it('validator() - add global custom validation method from this chain', function(){
      create()
        .validator('myGlobalValidatorFromChain', function(value, msg){
          if(this.val()[0] !== value) return msg || 'myGlobalValidatorFromChain: Oops!';
        }, true)
      create('asdf', good).myGlobalValidatorFromChain('a').msg().should.equal(good);
    })

    it('msg() - get message (success or error)', function(){
      create('', good).msg().should.equal(good);
      create('').invalid(bad).msg().should.equal(bad);
    })

    it('err() - get error (if any)', function(){
      create().err().should.equal('');
      create().invalid(bad).err().should.equal(bad);
    })

    it('val() - get value', function(){
      create(' a ').val().should.equal(' a ');
      create(' a ').trim().val().should.equal('a');
    })

    it('raw() - get raw value', function(){
      create(' a ').val().should.equal(' a ');
      create(' a ').trim().raw().should.equal(' a ');
    })

    it('json() - get json object with raw(), val(), msg() and err()', function(){
      var v = create(' a ', good).trim()
        , o = v.json();
      v.raw().should.equal(o.raw);
      v.val().should.equal(o.val);
      v.msg().should.equal(o.msg);
      v.err().should.equal(o.err);
    })

    it('onError() - on error callback', function(){
      var done = false;
      create().onError(function(){
        done = true;
        this.err().should.equal(bad);
      }).invalid(bad);
      done.should.equal(true);
    })

    it('raise() - throw ValidationError if there is any error', function(){
      var done = false;
      try {
        create().invalid(bad).raise();
      } catch(e) {
        done = true;
        (e instanceof vchains.ValidationError).should.equal(true);
      }
      done.should.equal(true);
    })

  })

  describe('Validators:', function(){

    it('invalid()', function(){
      create('123').invalid(bad).msg().should.equal(bad);
    })

    it('is()', function(){
      create('asdfgh', good).is(/^asd/).msg().should.equal(good);
      create('qasdfgh').is(/^asd/, bad).msg().should.equal(bad);
    })

    it('not()', function(){
      create('qasdfgh', good).not(/^asd/).msg().should.equal(good);
      create('asdfgh').not(/^asd/, bad).msg().should.equal(bad);
    })

    it('isEmpty()', function(){
      create('', good).isEmpty().msg().should.equal(good);
      create('asd').isEmpty(bad).msg().should.equal(bad);
    })

    it('notEmpty()', function(){
      create('asd', good).notEmpty().msg().should.equal(good);
      create('').notEmpty(bad).msg().should.equal(bad);
    })

    it('isEmail()', function(){
      create('asd@qwe.ru', good).isEmail().msg().should.equal(good);
      create('asd').isEmail(bad).msg().should.equal(bad);
    })

    it('isUrl()', function(){
      create('http://dot.net/dir/index.html?a=123&b=321', good).isUrl().msg().should.equal(good);
      create('asd').isUrl(bad).msg().should.equal(bad);
    })

    it('isIp()', function(){
      create('127.0.0.1', good).isIp().msg().should.equal(good);
      create('365.1.1.1').isIp(bad).msg().should.equal(bad);
    })

    it('isNum()', function(){
      create('-0987654321', good).isNum().msg().should.equal(good);
      create('-').isNum(bad).msg().should.equal(bad);
    })

    it('isAlpha()', function(){
      create('Hello', good).isAlpha().msg().should.equal(good);
      create('asd1').isAlpha(bad).msg().should.equal(bad);
    })

    it('isAlphanum()', function(){
      create('Hello123', good).isAlphanum().msg().should.equal(good);
      create('Hello 123').isAlphanum(bad).msg().should.equal(bad);
    })

    it('isInt()', function(){
      create('123', good).isInt().msg().should.equal(good);
      create('a123').isInt(bad).msg().should.equal(bad);
    })

    it('isFloat()', function(){
      create('-123.123E+12', good).isFloat().msg().should.equal(good);
      create('a123').isFloat(bad).msg().should.equal(bad);
    })

    it('isLt()', function(){
      create('123', good).isLt(124).msg().should.equal(good);
      create('123').isLt(122, bad).msg().should.equal(bad);
    })

    it('isLE()', function(){
      create('123', good).isLE(123).msg().should.equal(good);
      create('123').isLE(122, bad).msg().should.equal(bad);
    })

    it('isGt()', function(){
      create('123', good).isGt(122).msg().should.equal(good);
      create('123').isGt(124, bad).msg().should.equal(bad);
    })

    it('isGE()', function(){
      create('123', good).isGE(123).msg().should.equal(good);
      create('123').isGE(124, bad).msg().should.equal(bad);
    })

    it('isLen()', function(){
      create('123', good).isLen(0, 3).msg().should.equal(good);
      create('123').isLen(0, 2, bad).msg().should.equal(bad);
    })

    it('isEq()', function(){
      create('123', good).isEq(123).msg().should.equal(good);
      create('123').isEq(' 123', bad).msg().should.equal(bad);
    })

    it('isIn()', function(){
      create('a', good).isIn([ 'a', 'b', 'c' ]).msg().should.equal(good);
      create('z').isIn([ 'a', 'b', 'c' ], bad).msg().should.equal(bad);
    })

    it('notIn()', function(){
      create('z', good).notIn([ 'a', 'b', 'c' ]).msg().should.equal(good);
      create('a').notIn([ 'a', 'b', 'c' ], bad).msg().should.equal(bad);
    })

    it('isCard()', function(){
      create('4276-8010-1016-5090', good).isCard().msg().should.equal(good);
      create('1234-5678-9011-1213').isCard(bad).msg().should.equal(bad);
    })

  })

  describe('Cleaners:', function(){

    it('trim()', function(){
      create(' a ').trim().val().should.equal('a');
    })

    it('entityEncode()', function(){
      create('&>').entityEncode().val().should.equal('&amp;&gt;');
    })

    it('entityDecode()', function(){
      create('&amp;&gt;').entityDecode().val().should.equal('&>');
    })

  })

/*  describe('Custom validators:', function(){

    it('Add global custom validation method', function(){
      vchains.validator('test0', function(msg){
        if(this.val().length) return msg || 'Error';
      });
    })

    it('Use this custom validation method', function(){
      create('').test0().msg().should.equal('');
      create(' ').test0().msg().should.equal('Error');
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
      create('1').test1().msg().should.equal('');
      create('1').test2().msg().should.equal('Error');
    })

    it('Add local custom validation method from chain', function(){
      v = create('333').validator('test3', function(msg){
        if(this.val().length != 3) return msg || 'Error';
      });
    })

    it('Use this custom validation method', function(){
      v.test3().msg().should.equal('');
    })

    it('Add global custom validation method from chain', function(){
      create('4444').validator('test4', function(msg){
        if(this.val().length != 4) return msg || 'Error';
      }, true);
    })

    it('Use this custom validation method', function(){
      create('4444').test4().msg().should.equal('');
    })

  })*/

});