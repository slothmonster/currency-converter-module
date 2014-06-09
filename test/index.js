var currency = require('../index')(); //({baseCurrency:"GBP"});

currency.init({openExchangeRatesAppId: process.env.OPEN_EXCHANGE_KEY});

// setTimeout(function(){currency.getCurrencyForCountry();}, 5000);
// currency.getCurrencyForCountry();

console.log('done with test/index.js work');