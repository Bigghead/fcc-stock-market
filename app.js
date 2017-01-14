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
},function(err, quandl){
  res.send(quandl);
});

});

app.listen('9000', function(){
  console.log('Stock Chart Starting!');
});
