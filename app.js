var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var hangups = require('hangupsjs');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// Connect to Hangouts
var people = [
  { name: "Isaac", email: "isaacwaller.com@gmail.com", conversation: "Ugy_qvST55Hh_7SjT1B4AaABAQ" }
];

var hangoutsToken = "4/zZeYxT_pqk5ay7mYWUD00s-WleWJUUrV2x9PISuE6ow";
var client = new hangups();

client.on('chat_message', function (event) {
  console.log(event);
});

var creds = function() {
  return {
    // TODO: improve auth
    auth: hangups.authStdin
  };
};


client.connect(creds).then(function() {
    console.log("connected to hangouts");
    bld = new hangups.MessageBuilder()
    segments = bld.text('Hello ').bold('World').text('!!!').toSegments()
    // client.sendchatmessage(people[0].conversation, segments);
}).done();

module.exports = app;
