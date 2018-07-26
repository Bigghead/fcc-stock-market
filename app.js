var express     = require('express'),
    mongoose    = require('mongoose'),
    Highcharts  = require('highcharts'),
    // keys        = require('./apiKeys'),
    bodyParser  = require('body-parser'),
    Async       = require('async'),
    Method      = require('method-override'),
    Quandl      = require('quandl'),
    axios       = require('axios');
    app         = express();


var mongoUser = process.env.mongoUser || mongoUser,
    mongoPass = process.env.mongoPass || mongoPass,
    Key        = process.env.Key || Key,
    port       = process.env.PORT || 9000;

//=======DATABASE=====
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://'+ mongoUser +':'+ mongoPass +'@ds111469.mlab.com:11469/fcc-stocks');

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



//==============SHOW ALL STOCK LINES ON CHART=====
app.get('/', function(req, res){

  Stocks.find({}, function(err, foundStocks){
    if(err){
      console.log(err);      
    } else {
      res.render('test' ,{stocks: foundStocks});
    }
  });
});



//===========ADD A NEW STOCK ONTO CHART=======
app.post('/', async(req, res) => {
  const { stockName } = req.body;

  //Check if we have the stock in db
  //If yes, redirect, don't let them add the same stock
  try {

    const foundStock = await Stocks.findOne( { name: stockName } );
    if( foundStock !== null ) return res.redirect('/');

    const stockData = await axios.get(`https://api.iextrading.com/1.0/stock/${stockName}/chart/5y`);
    const chartData = await stockData.data.map( d => [ 
      new Date(d['date']).getTime(), d['close']
    ] );

    const newStock = await Stocks.create( {
      name: stockName,
      data : chartData
    } );

    res.redirect('/');
    
  } catch( e ) {

    res.redirect('/');

  }

});


//==========REMOVE STOCK FROM HOMEPAGE CHART========
app.get('/stocks/:id', function(req, res){
  var id = req.params.id;

  Stocks.findByIdAndRemove(id, function(err, delStock){
    if(err){
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

app.listen(port, function(){
  console.log('Stock Chart Starting!');
});
