var express     = require('express'),
    mongoose    = require('mongoose'),
    Highcharts  = require('highcharts'),
    keys        = require('./apiKeys'),
    bodyParser  = require('body-parser'),
    Async       = require('async'),
    cors        = require('cors'),
    Quandl      = require('quandl'),
    app         = express();



//=======DATABASE=====
mongoose.connect('mongodb://'+ keys.mongoUser +':'+ keys.mongoPass +'@ds111469.mlab.com:11469/fcc-stocks');

var stockSchema = new mongoose.Schema({
  name: String,
  data: []
});

var Stocks = mongoose.model('Stock', stockSchema);


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


app.get('/', function(req, res){
  var array = [];
  Stocks.find({}, function(err, stocks){
    if(err){
      console.log(err);
    } else {
      res.render('landing', { stockNames : stocks, apiKey : keys.Key});
    }
  });
});


app.post('/', function(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  var stockName = req.body.stockName.toUpperCase();

  Stocks.create({
    name: stockName
  }, function(err, madeStock){
    if(err){
      console.log(err);
    } else {
    res.redirect('/');
    }
  });
});

app.get('/test', function(req, res){
  Stocks.find({}, function(err, foundStocks){
    if(err){
      console.log(err);
    } else {
      console.log(foundStocks);
      res.render('test' ,{stocks: foundStocks});
    }
  });
});

app.post('/test', function(req, res){
  var stockName = req.body.stockName.toUpperCase();
  quandl.dataset({
    source: 'WIKI',
    table: stockName
  },{
    start_date: "2016-01-01",
    end_date: "2016-12-30",
    column_index: 4
  },function(err, stockData){
    if(err){
      console.log(err);
    } else {
      var stock = JSON.parse(stockData).dataset;
       var highData = stock.data.map(function(d){
        return [new Date(d[0]).getTime(), d[1]];
      });
      stockPrices = highData.reverse();
      Stocks.create({
        name: stockName,
        data : stockPrices
      }, function(err, madeStock){
        if(err){
          console.log(err);
        } else {
          res.redirect('/test');
        }
      });
    }
  });
})

app.listen('9000', function(){
  console.log('Stock Chart Starting!');
});
