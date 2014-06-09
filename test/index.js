var currency = require('../index')(); //({baseCurrency:"GBP"});

currency.init({openExchangeRatesAppId: process.env.OPEN_EXCHANGE_KEY});

// setTimeout(function(){currency.getCurrencyForCountry();}, 5000);
setTimeout(function(){
  currency.conversionRate("USD", "USD")
  .then(function(x){
    console.log('loggin mr x', x);
  });
}, 5000);

setTimeout(function(){
  currency.convertCurrency(1456, "GBP", "USD")
  .then(function(x){
    console.log('loggin mr y', x);
  });
}, 5000);
// currency.getCurrencyForCountry();

console.log('done with test/index.js work');