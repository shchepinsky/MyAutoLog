'use strict';

var fs = require('fs');
var express = require('express');
var https = require('https');
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

// https server params: key and cert
var options = {
    key: fs.readFileSync('cert/server-key.pem'),
    cert: fs.readFileSync('cert/server-cert.pem')
};

var PORT = 8080;
var HOST = '0.0.0.0';

var server = https.createServer(options, app).listen(PORT, HOST, function() {
    console.log('HTTPS server started on ' + HOST + ':' + PORT);
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

