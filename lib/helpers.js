var openExchange = require('./openExchange');
var Promise = require('bluebird');


module.exports = {
  updateRates: function(apiKey){
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
        );
      }
    });
  }
};

