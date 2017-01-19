var express     = require('express'),
    mongoose    = require('mongoose'),
    Highcharts  = require('highcharts'),
    keys        = require('./apiKeys'),
    bodyParser  = require('body-parser'),
    Async       = require('async'),
    Method      = require('method-override'),
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
app.use(Method('_method'));


//=========QUANDL CONFIG========
var quandl = new Quandl({
  auth_token: keys.Key,
  api_version: 3
})




app.get('/test', function(req, res){
  Stocks.find({}, function(err, foundStocks){
    if(err){
      console.log(err);
    } else {
      res.render('test' ,{stocks: foundStocks});
    }
  });
});

app.post('/test', function(req, res){
  var stockName = req.body.stockName.toUpperCase();


  //Check if we have the stock in db
  //If yes, redirect, don't let them add the same stock
  Stocks.find({name: stockName}, function(err, foundStock){
    if(err){
      console.log(err);
    } else {
      console.log(foundStock === undefined);
      if(foundStock !== undefined){
        res.redirect('/test');
      } else {


        //otherwise, fetch quandl data, put into db, and redirect to show all stocks
        quandl.dataset({
          source: 'WIKI',
          table: stockName
        },{
          start_date: "2016-01-01",
          end_date: "2016-12-30",
          column_index: 4
        },function(err, stockData){
           //=======If Stock Name isn't a Nasdaq, redirect back to home page
            if(JSON.parse(stockData).quandl_error){
            console.log(err);
            res.redirect('/test');
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
                madeStock.save();
                res.redirect('/test');
              }
            });
          }
        });

      }
    }
  });

});

app.get('/test/:id', function(req, res){
  var id = req.params.id;

  Stocks.findByIdAndRemove(id, function(err, delStock){
    if(err){
      console.log(err);
    } else {
      console.log(delStock.name);
      res.redirect('/test');
    }
  });
});

app.listen('9000', function(){
  console.log('Stock Chart Starting!');
});
