"use strict";

var passport = require('passport');
var passportLocal = require('passport-local');
var users = require('./users.js');

// setup registering with username and password
passport.use('local-register',
    new passportLocal.Strategy({passReqToCallback: true}, localRegister));

function localRegister(req, username, password, done) {

    // validate password and username to conform rules
    if (!users.usernameObeysPolicy(username)) {
        req.flash('message', 'username is empty or too short');
        return done(null, null);
    }

    if (!users.passwordObeysPolicy(password)) {
        req.flash('message', 'passwords is empty or too short');
        return done(null, null);
    }

    users.create(username, password, createResult);

    function createResult(err, user) {
        if (err) {
            req.flash('error', err);
            return done(err, null);
        }

        if (user) {
            req.flash('message', 'registered new user: ' + username);
            return done(null, user);
        } else {
            req.flash('message', 'username already in use');
            return done(null, null);
        }
    }

}

// setup local login strategy using username and password
passport.use('local-login',
    new passportLocal.Strategy({passReqToCallback: true}, localLogin));

function localLogin(req, username, password, done) {
    users.findOneByName(username, findCallback);

    function findCallback (err, user) {
        if (err) {
            req.flash('error', err);
            return done(err);
        }

        if (!user) {
            req.flash('message', 'user not found');
            return done(null, false);
        }

        if (users.isValidPassword(user, password)) {
            return done(null, user);
        } else {
            req.flash('message', 'invalid password');
            return done(null, false);
        }
    }
}

passport.serializeUser(users.serializeUser);
passport.deserializeUser(users.deserializeUser);

