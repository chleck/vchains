require('should');

vchains = require('../index.js');
validate = vchains.validate;

describe('Test suite for vchains validation library', function(){

  describe('API:', function(){

    it('Create validation object', function(){
      var v = validate();
    })

    it('Add custom validation method by API call', function(){
      vchains.use('test', function(msg){
        if(this.value.length) return msg || 'Error';
      });
    })

    it('Use custom validation method added by API call (valid)', function(){
      validate('').test().msg().should.equal('');
    })

    it('Use custom validation method added by API call (error)', function(){
      validate(' ').test().msg().should.equal('Error');
    })

  })

  describe('Validators:', function(){

    it('isInt() (valid)', function(){
      validate('123').isInt().msg().should.equal('');
    })

    it('isInt() (error)', function(){
      validate('a123').isInt().msg().should.equal('Bad int value');
    })

  })

});