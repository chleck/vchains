vchains = require('../index.js');
validate = vchains.validate;

describe('Test suite for vchains validation library', function(){

  describe('API:', function(){

    it('Create validation object', function(){
      var v = validate();
    })

    it('Add custom validation method by API call ( test() )', function(){
      vchains.use('test', function(msg){
        if(this.value.length) return msg || 'Error';
      });
    })

    it('Add multiple custom validation method by API call ( test1() & test2() )', function(){
      vchains.use({
        'test1': function(msg){
          if(this.value.length != 1) return msg || 'Error';
        },
        'test2': function(msg){
          if(this.value.length != 2) return msg || 'Error';
        }
      });
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

  describe('Custom validators:', function(){

    it('Use custom validation method added by API call (valid)', function(){
      validate('').test().msg().should.equal('');
    })

    it('Use custom validation method added by API call (error)', function(){
      validate(' ').test().msg().should.equal('Error');
    })

    it('Use multiple custom validation method added by API call (valid)', function(){
      validate('1').test1().msg().should.equal('');
    })

    it('Use multiple custom validation method added by API call (error)', function(){
      validate('1').test2().msg().should.equal('Error');
    })

  })

});