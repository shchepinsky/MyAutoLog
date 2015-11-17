'use strict';

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var flash = require('connect-flash');
var logger = require('morgan');

var app = express();

var strategies = require('./strategies');
var users = require('./users.js');
var api = require('./api.js');

app.set('view engine', 'ejs');

// start server on all addresses 0.0.0.0
var port = 8080;
var host = '0.0.0.0';
var server = http.createServer(app).listen(port, host, function () {
    console.log('Server is listening: ' + host + ':' + port );
});

// first middleware - log all requests
app.use(logger('dev'));

// cookies
app.use(cookieParser());

// configure express-session
app.use(expressSession({
    secret: 'MySessionSecretKey',   // secret to manage sessions
    resave: false,                  // do not store unmodified session
    saveUninitialized: false        // do not save new untouched sessions
}));

// flash messages
app.use(flash());

// to parse username and password from login form
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// configure passport
app.use(passport.initialize());
app.use(passport.session());



var appPath = '../client/app';
app.use('/', express.static(appPath));  // serve single page application folder at site root

var login = require('./login');
app.use(login);

//using router to manage api routes
app.use(api);
