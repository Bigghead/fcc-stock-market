var express     = require('express'),
    mongoose    = require('mongoose'),
    Highcharts  = require('highcharts'),
    quandlKey   = require('./apiKeys'),
    Quandl      = require('quandl'),
    app         = express();

app.set('view engine', 'ejs');


app.use(express.static(__dirname + '/public'));


//=========QUANDL CONFIG========
var quandl = new Quandl({
  auth_token: quandlKey.Key,
  api_version: 3
})

app.get('/', function(req, res){
  quandl.dataset({
  source: "WIKI",
  table: "FB"
}, {
  start_date: "2016-01-01",
  end_date: "2016-12-30",
  column_index: 4
}, function(err, stockData){
  var stock = JSON.parse(stockData).dataset;
 //  var highData = stock.data.map(function(d){
 //   return [new Date(d[0]).getTime(), d[1]];
 // });
 stockPrices = stock.data.reverse();
  console.log(stockPrices);
  res.render('landing', {stockPrices : stockPrices});
});

});

app.listen('9000', function(){
  console.log('Stock Chart Starting!');
});
