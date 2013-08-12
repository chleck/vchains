vchains = require('../index.js');
validate = vchains.validate;

var v;

describe('Test suite for vchains validation library', function(){

  describe('Base:', function(){

    it('Create validation object', function(){
      v = validate();
      var t = typeof v;
      t.should.equal('object');
    })

    it('Extend validation object', function(){
      vchains.extend('ext', function(){
        return 'ext';
      });
      validate().ext().should.equal('ext');
    })

  })

  describe('Validators:', function(){

    it('isInt()', function(){
      validate('123').isInt().msg().should.equal('');
      validate('a123').isInt().msg().should.equal('Bad int value');
    })

    it('is()', function(){
      validate('asdfgh').is(/^asd/).msg().should.equal('');
      validate('qasdfgh').is(/^asd/).msg().should.equal('Bad value');
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