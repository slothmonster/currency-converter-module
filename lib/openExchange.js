var http = require('http');
var Promise = require('bluebird');

module.exports = {
  getCurrentRates: function(openExchangeId){
    return new Promise(function(resolve, reject){
      http.get("http://openexchangerates.org/api/latest.json?app_id=" + openExchangeId, function(res){
        res.response = '';
        res.setEncoding('utf8');
        res.on('data', function(chunk){
          res.response += chunk;
        });
        res.on('end', function(x){
          if(res.statusCode === 200){
            resolve(JSON.parse(res.response));
          } else {
            reject("Error calling the openExchangeRates API " + res.response);
          }
        });
      })
      .on('error', function(e){
        reject(e);
      });
    });
  }
};