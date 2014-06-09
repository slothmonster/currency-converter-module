var fs = require('fs');
var path = require('path');
var openExchange = require('./lib/openExchange');
var helpers = require('./lib/helpers');
var Promise = require('bluebird');

fs = Promise.promisifyAll(fs);

module.exports = function(initOptions){
  //should provide access methods to access the flat file storage of exchange rate data

  //make it so that the module can only be initialized once? similar to the underscore _.once method?
  // var initialized = false;

  var currencyFile;
  var updateInterval;
  var baseCurrency;
  var openExchangeRatesAppId;
  var ratesUpdatedAt;

  var currencyModule = {};

  currencyModule.init = function(optionsObj){
    // console.log('optionsObj', optionsObj);

      if(!optionsObj || Object.prototype.toString.call(optionsObj) !== "[object Object]"){
        throw new Error("Invalid arguments for initialization of currency module.");
      }
      //default should be "./storage/rates.txt"
      currencyFile = optionsObj.currencyFile || "../storage/rates.txt";
      //time in milis, default should be 1 hour = 3600000 milis
      updateInterval= optionsObj.updateInterval || 3600000;
      //necessary for the module to work
      openExchangeRatesAppId = optionsObj.openExchangeRatesAppId;
      
      //TODO: figure out if/how to get this working. on read lookup from api will have to map all currencies over to the specified base.
      //default to US Dollars this might get more complicated than it's worth
      // baseCurrency = optionsObj.baseCurrency || "USD";
      
      //perform initial load of rates if open exchange api key is specified
      if(openExchangeRatesAppId){
        updateRates(openExchangeRatesAppId)
        .then(function(){
          console.log('thenned on the update promise');
        })
        .catch(function(err){
          console.log('caught the error from update', err);
        });
      }
  };

  if(initOptions){
    // console.log('initOptions ==== ', initOptions);
    currencyModule.init(initOptions);
  }


  currencyModule.getCurrencyForCountry = function(countryCode){
    var currencyProfile = {};
    updateRates(openExchangeRatesAppId)
    .then(function(){
      console.log('doing some stuff to lookup currency');
    });
    // add these to profile {currencyCode:"", currencySymbol:, conversionRateFromDollar};
    
    // return currencyInfo;
  };
  
  //getConversionRate(convertFrom, convertTo){return conversionRate}
  
  //convertCurrency(amount, currencyCodeFrom, currencyCodeTo){return amount of currencyCodeTo}

  return currencyModule;

};