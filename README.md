currency-converter-module
=========================

Just a little node module to handle currency conversion.

documentation for the 'simple-currency-conversion' module available on npm

### Quick Start
First install:
```javascript
npm install simple-currency-conversion
```
Then require:
```javascript
var currency = require('simple-currency-conversion')();
```

### Usage
The simple currency-conversion-module needs to be initialized with a JavaScript object of options either when you first require the module, or before you attempt to use any of it's methods. All of the options are, well, optional except that you must specifiy either a static file to serve your own exchange rates from, or a valid API key from [Open Exchange Rates](https://openexchangerates.org/signup). Don't worry, there's a free plan if you just want to try things out.

How to init:
```javascript
var options = {
  currencyFile: "path/to/static/rates/file", //use this only if you want to only serve consistently static rates
  updateInterval: 3600000, //time in milliseconds to cache rates before updating from live api. default is 1 hour on open exchange free plan
  openExchangeRatesAppId: "YOUR_OPEN_EXCHANGE_API_KEY"
};
//you can then use the options object to init the currency module when you require...
var currency = require('simple-currency-conversion')(options);

//or, you can init the currency module after requiring...
var currency = rquire('simple-currency-conversion')();
currency.init(options);
```
After you have loaded and initialized the 'simple-currency-conversion' module, you then have access to three methods:

__getCurrencyProfile(countryCode);__
When called with any valid 3 digit currency code, getCurrencyProfile() will return a bluebird promise that when successfully resolved will give you an object containing data about the currency you queried.
Example:
```javascript
currency.getCurrencyProfile("USD");

//eventually resolves to 
{
  "symbol": "$",
  "name": "US Dollar",
  "symbol_native": "$",
  "decimal_digits": 2,
  "rounding": 0,
  "code": "USD",
  "name_plural": "US dollars"
}
```
__conversionRate(fromCurrencyCode, toCurrencyCode);__
When called with valid 3 digit currency codes for the 'from' and 'to' parameters, conversionRate() returns a bluebird promise that eventually resolves to a JavaScript number representing the conversion rate between the two currencies.

```javascript
currency.conversionRate("GBP", "USD");

//eventually resolves to
1.68
```

__convertCurrency(amount, fromCurrencyCode, toCurrencyCode);__
When called with valid 3 digit codes for the 'from' and 'to' parameters as well as an 'amount' parameter that is a Javascript 'Number' type, convertCurrency() will return a bluebird promise that eventually resolves to a number that is the value of the original amount in terms of the currency it was exchanged to.

```javascript
currency.convertCurrency(100, "USD", "CNY");

//eventually resolves to
624.02
```

