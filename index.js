var fs = require('fs');
var path = require('path');
var openExchange = require('./lib/openExchange');
var Promise = require('bluebird');
var profiles = require('./lib/currencyProfiles');

fs = Promise.promisifyAll(fs);

//helper method to handle the rounding of numbers to two decimal places
//code from Stack Overflow users MarkG and Lavamantis http://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-in-javascript
Number.prototype.round = function(places) {
  return +(Math.round(this + "e+" + places) + "e-" + places);
};

module.exports = function(initOptions){

  var currencyFile;
  var updateInterval;
  var baseCurrency;
  var openExchangeRatesAppId;
  var ratesUpdatedAt;
  //TODO: implement live rates only
  var liveRatesOnly;

  var currencyModule = {};

  var updateRates = function(apiKey){
    if(!apiKey){
      return new Promise(function(resolve, reject){
        if(currencyFile === '../storage/rates.txt'){
          reject('no apiKey specified to retrieve rates and no static file of rates provided.');
        }
        resolve();
      });
    }

    var now = new Date().getTime();

    //if the rates have been updated within the alloted update interval, resolve promise to move to next function
    //if not, request updated rates from api, write to file, then resolve promise to pass control flow on
    return new Promise(function(resolve, reject){
      if(now - ratesUpdatedAt < updateInterval){
        resolve();
      } else {
        resolve(
          openExchange.getCurrentRates(apiKey)
          .then(function(ratesObj){
            ratesUpdatedAt = ratesObj.timestamp * 1000; //convert to millis (openExchange returns time in seconds)
            var ratesBuffer = "";
            var symbol;
            for(var rate in ratesObj.rates){
              if(profiles[rate] && profiles[rate].symbol_native){
                symbol = profiles[rate].symbol_native;
              } else {
                symbol = "";
              }
              ratesBuffer += rate + "=" + symbol + " " + ratesObj.rates[rate].round(2) + "\n";
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
        currencySymbol = spaceSplit[0];
        currencyRate = spaceSplit[1];
        
        //add mapping by for rate and symbol by currency code
        ratesBuffer += "\"" + currencyCode + "\":{\"rate\":" + currencyRate + ",\"symbol\":\"" + currencySymbol + "\"}";
        
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

      if(!optionsObj || Object.prototype.toString.call(optionsObj) !== "[object Object]"){
        throw new Error("Invalid arguments for initialization of currency module.");
      }
      //default should be "./storage/rates.txt"
      currencyFile = optionsObj.currencyFile || path.join(__dirname, './storage/rates.txt');
      //time in milis, default should be 1 hour = 3600000 milis
      updateInterval = optionsObj.updateInterval || 3600000;
      //necessary for the module to work
      openExchangeRatesAppId = optionsObj.openExchangeRatesAppId;

      //initialize liveLoadOnly to false if not specified
      liveLoadOnly = optionsObj.liveLoadOnly || false;
      
      //TODO: make the option available for setting the default currency to something other than USD
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
    currencyModule.init(initOptions);
  }



  // TODO: add a method to return the full currency profile for a given currency
  currencyModule.getCurrencyProfile = function(countryCode){
    return new Promise(function(resolve, reject){
      if(profiles[countryCode]){
        resolve(profiles[countryCode]);
      } else {
        reject("no currency available for that country code");
      }
    });
  };
  
  currencyModule.conversionRate = function(from, to){
    return updateRates().then(function(){
      return getRatesObject();
    })
    .then(function(rates){
      if(!rates[from] || !rates[to]){
        throw new Error(to + " and/or " + from + " is not a valid currency code/symbol");
      }
      return rates[to].rate * (1 / rates[from].rate);
    });
  };
  
  currencyModule.convertCurrency = function(amount, from, to){
    return currencyModule.conversionRate(from, to)
    .then(function(rate){
      return (amount * rate).round(2);
    });

  };

  return currencyModule;

};