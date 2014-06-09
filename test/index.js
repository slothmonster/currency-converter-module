var chai = require('chai');
var should = require('chai').should();
var expect = require('chai').expect();
var chaiAsPromised = require('chai-as-promised');
var path = require('path');
// var currency = require('../index')(); // ({currencyFile: path.join(__dirname, './testRates.txt')}); 
// var conversionRate = currency.conversionRate;
// var convertCurrency = currency.convertCurrency;

chai.use(chaiAsPromised);

describe('conversionRate and convertCurrency methods', function(){
  before(function(){
    var currency = require('../index')();
    currency.init({currencyFile: path.join(__dirname, './testRates.txt')});
    conversionRate = currency.conversionRate;
    convertCurrency = currency.convertCurrency;
  });
  it('conversionRate should give a valid rate for converting USD to GBP', function(){
    return conversionRate('USD', 'GBP').should.eventually.equal(0.59);
  });

  it('conversionRate should give an error for currencies that do not exist', function(){
    return conversionRate('USD', 'BAM').should.be.rejected;
  });

  it('convertCurrency should give the correct conversion for a given amount', function(){
    return convertCurrency(1456, "GBP", "RUB").should.eventually.equal(84768.81);
  });

  it('convertCurrency should handle negative numbers', function(){
    return convertCurrency(-1456, "GBP", "USD").should.eventually.equal(-2467.8);
  });

  it('convertCurrency should throw an error if converting currencies that do not exist', function(){
    return convertCurrency(1200, "GBP", "BAM").should.be.rejected;
  });
});