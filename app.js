var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
var mysqlsync = require('sync-mysql');
var fileUpload = require('express-fileupload');
var mailer = require('express-mailer');
var session = require('express-session');
var secret = require(__dirname + "/helper/secret");

var indexRouter = require('./routes/index');
var candidateRouter = require('./routes/candidates');
var examRouter = require('./routes/exams');
var topicRouter = require('./routes/topics');
var positionRouter = require('./routes/positions');
var questionRouter = require('./routes/questions');
var hrRouter = require('./routes/hrs');

var app = express();

// create connection to database
var db = mysql.createConnection({
  host: 'bfavros1a-mysql.services.clever-cloud.com',
  user: 'uwckeymkkab6tfqt',
  password: 'w3bbS89X23WCDw2OHWM',
  database: 'bfavros1a',
  port: 3306,
  multipleStatements: true
});

var dbsync = new mysqlsync({
  host: 'bfavros1a-mysql.services.clever-cloud.com',
  user: 'uwckeymkkab6tfqt',
  password: 'w3bbS89X23WCDw2OHWM',
  database: 'bfavros1a',
  port: 3306,
  multipleStatements: true
});

db.connect(function (err) {
  if (err) throw err
  console.log('> connected to db...');
  var sql1 = "SELECT * FROM hr";
  db.query(sql1, function (err, result1) {
    if (err)
      return res.status(500).send(err);
    if (result1.length == 0) {
      var name = "ahmed";
      var email = "ahmedayman6038@gmail.com";
      var password = secret.hide("ahmed123");
      var sql2 = "INSERT INTO `hr`(`Name`, `Password`, `Email`) VALUES ('" + name + "','" + password + "','" + email + "')";
      db.query(sql2, function (err, result2) {
        if (err)
          return res.status(500).send(err);
        console.log('> hr added sucessfully');
      })
    }
  })
});

global.db = db;
global.dbsync = dbsync;


mailer.extend(app, {
  from: 'no-reply@example.com',
  host: 'smtp.gmail.com',
  secureConnection: true,
  port: 465,
  transportMethod: 'SMTP',
  auth: {
    user: 'onlinetestingia@gmail.com',
    pass: 'jzlsnogjvozqduhi'
  }
});

// Define authentication middleware
var authenticate = function (req, res, next) {
  if (req.session.hrId) {
    res.locals.userId = req.session.hrId;
    res.locals.userName = req.session.hrName;
    res.locals.userEmail = req.session.hrEmail;
    next();
  } else {
    res.locals.userUrl = req.originalUrl;
    return res.render('login', {
      title: 'Login',
      error: ""
    });
  }
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(fileUpload());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use(express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use('/', indexRouter);
app.use('/candidates', authenticate, candidateRouter);
app.use('/exams', authenticate, examRouter);
app.use('/topics', authenticate, topicRouter);
app.use('/positions', authenticate, positionRouter);
app.use('/questions', authenticate, questionRouter);
app.use('/hrs', authenticate, hrRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;