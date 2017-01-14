var express     = require('express'),
    mongoose    = require('mongoose'),
    Highcharts  = require('highcharts'),
    quandlKey   = require('./apiKeys'),
    Quandl      = require('quandl'),
    bodyParser  = require('body-parser'),
    app         = express();

app.set('view engine', 'ejs');


app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));


//=========QUANDL CONFIG========
var quandl = new Quandl({
  auth_token: quandlKey.Key,
  api_version: 3
})

app.get('/', function(req, res){
  var stockName = 'FB';
  quandl.dataset({
  source: "WIKI",
  table: stockName
}, {
  start_date: "2016-01-01",
  end_date: "2016-12-30",
  column_index: 4
}, function(err, stockData){
  if(err){
    console.log(err);
  } else {
  var stock = JSON.parse(stockData).dataset;
 //  var highData = stock.data.map(function(d){
 //   return [new Date(d[0]).getTime(), d[1]];
 // });
 stockPrices = stock.data.reverse();
  res.render('landing', {stockPrices : stockPrices, stockName : stockName});
    }
  });
});


app.post('/', function(req, res){
  var stockName = req.body.stockName;
  quandl.dataset({
  source: "WIKI",
  table: stockName
}, {
  start_date: "2016-01-01",
  end_date: "2016-12-30",
  column_index: 4
}, function(err, stockData){

  //=======If Stock Name isn't a Nasdaq, redirect back to home page
  if(JSON.parse(stockData).quandl_error){
    console.log(err);
    res.redirect('/');
  } else {
  var stock = JSON.parse(stockData).dataset;
 //  var highData = stock.data.map(function(d){
 //   return [new Date(d[0]).getTime(), d[1]];
 // });
 stockPrices = stock.data.reverse();
  res.render('landing', {stockPrices : stockPrices, stockName: stockName});
    }
  });
})

app.listen('9000', function(){
  console.log('Stock Chart Starting!');
});
