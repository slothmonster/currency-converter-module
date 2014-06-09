var fs = require('fs');
var path = require('path');
var openExchange = require('./lib/openExchange');
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

  var updateRates = function(apiKey){
    var now = new Date().getTime();
    //if the rates have been updated within the alloted update interval, resolve promise to move to next function
    //if not, request updated rates from api, write to file, then resolve promise to pass control flow on
    return new Promise(function(resolve, reject){
      if(now - ratesUpdatedAt < updateInterval){
        console.log('up to date');
        resolve();
      } else {
        resolve(
          openExchange.getCurrentRates(apiKey)
          .then(function(ratesObj){
            ratesUpdatedAt = ratesObj.timestamp * 1000; //convert to millis (openExchange returns time in seconds)
            var ratesBuffer = "";
            for(var rate in ratesObj.rates){
              ratesBuffer += rate + "= " + ratesObj.rates[rate] + "\n";
            }
            return ratesBuffer;
          })
          .then(function(ratesBuffer){
            return fs.writeFileAsync(currencyFile, ratesBuffer);
          })
          .catch(function(err){
            reject(err);
          })
        );
      }
    });
  };

  var getRatesObject = function(){
    //deserialize the data from the currency text file
    return fs.readFileAsync(currencyFile, {encoding: 'utf8'}).then(function(data){
      var ratesBuffer = "{";
      var currencyCode;
      var currencyRate;
      var currencySymbol;
      var currencies = data.split('\n');
      var equalSplit;
      var spaceSplit;

      for(var i=0; i<currencies.length -1; i++){
        equalSplit = currencies[i].split('=');
        spaceSplit = equalSplit[1].split(" ");
        currencyCode = equalSplit[0];
        // TODO: add currencySymbol = spaceSplit[0];
        currencyRate = spaceSplit[1];
        ratesBuffer += "\"" + currencyCode + "\":" + currencyRate;
        
        //only add a comma if it is not the last in the list
        if(i < currencies.length -2){
          ratesBuffer += ",";
        }
      }
      ratesBuffer += "}";
      return JSON.parse(ratesBuffer);
    });
  };

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
          console.log('exchangeRates have been initialized');
        })
        .catch(function(err){
          console.log('caught the error from updateRates', err);
        });
      }
  };

  if(initOptions){
    // console.log('initOptions ==== ', initOptions);
    currencyModule.init(initOptions);
  }




  // currencyModule.getCurrencyForCountry = function(countryCode){
  //   var currencyProfile = {};
  //   updateRates(openExchangeRatesAppId)
  //   .then(function(){
  //     console.log('doing some stuff to lookup currency');
  //   });
  //   // add these to profile {currencyCode:"", currencySymbol:, conversionRateFromDollar};
    
  //   // return currencyInfo;
  // };
  
  currencyModule.conversionRate = function(from, to){
    return getRatesObject()
    .then(function(rates){
      if(!rates[from] || !rates[to]){
        throw new Error(to + " and/or " + from + " is not a valid currency code/symbol");
      }
      return rates[to] * (1 / rates[from]);
    });
  };
  
  currencyModule.convertCurrency = function(amount, from, to){
    return this.conversionRate(from, to)
    .then(function(rate){
      return amount * rate;
    });

  };

  return currencyModule;

};