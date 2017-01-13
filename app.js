var express  = require('express'),
    mongoose = require('mongoose'),
    Highcharts  = require('highcharts'),
    app      = express();


app.set('view engine', 'ejs');


app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('landing');
});

app.listen('9000', function(){
  console.log('Stock Chart Starting!');
});
