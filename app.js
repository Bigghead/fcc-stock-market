var express     = require('express'),
    mongoose    = require('mongoose'),
    Highcharts  = require('highcharts'),
    keys        = require('./apiKeys'),
    Quandl      = require('quandl'),
    bodyParser  = require('body-parser'),
    Async       = require('async'),
    cors        = require('cors'),
    app         = express();



//=======DATABASE=====
mongoose.connect('mongodb://'+ keys.mongoUser +':'+ keys.mongoPass +'@ds111469.mlab.com:11469/fcc-stocks');

var stockSchema = new mongoose.Schema({
  name: String,
  data: []
});

var Stocks = mongoose.model('Stock', stockSchema);
// Stock.create({
//   name: 'FB'
// }, function(err, saved){
//   if(err){
//     console.log(err);
//   } else {
//     console.log('Saved ' + saved.name);
//   }
// });

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept");

  next();
});

//=========QUANDL CONFIG========
var quandl = new Quandl({
  auth_token: keys.Key,
  api_version: 3
})


// app.get('/', function(req, res){
//   var array = [];
//   Stocks.find({}, function(err, stocks){
//     if(err){
//       console.log(err);
//     } else {
//       // Async.each(stocks, function(stock, callback){
//       //   array.push(stock.name);
//       //   callback();
//       // }, function(err){
//       //   if(err){
//       //     console.log(err);
//       //   } else {
//       //     console.log('hello');
//       //     console.log(array);
//       //   }
//       // });
//       for(var i = 0 ; i < stocks.length; i ++){
//         array.push(stocks[i].name);
//         console.log(stocks[i].name);
//       }
//       console.log(array);
//       console.log(res.header);
//       res.render('landing', { stockNames : array});
//     }
//   });
// });


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
  res.render('landing', {stockPrices : stockPrices, stockName : stockName, apiKey : keys.Key});
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
  var highData = stock.data.map(function(d){
   return [new Date(d[0]).getTime(), d[1]];
 });
  res.render('landing', {stockPrices : highData, stockName: stockName, apiKey : keys.Key});
    }
  });
});

app.listen('9000', function(){
  console.log('Stock Chart Starting!');
});
