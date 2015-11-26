"use strict";

var https = require('https');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('jsonwebtoken');
var users = require('./users');
var tokens = require('./tokens');


// registration routes
router.post('/register', passport.authenticate('local-register', {
    failureFlash: true,
    failureRedirect: '/register/failure'
}), function (req, res) {

    res.status(201).send('registered' + req.username);
});

router.get('/register/failure', function (req, res) {

    if (req.session.flash.error) {
        // error is set in passport when something like database failed
        res.status(500).send(req.flash('error'));

    } else {
        // registration impossible due to conflict of username or policy
        res.status(409).send(req.flash('message'));
    }
});
// registration routes

function makeLoginSuccessResponse(user) {
    console.log('makeLoginSuccessResponse');

    var client = user.firstName && user.lastName
        ? user.firstName + ', ' + user.lastName
        : user.username;

    // return response with token
    var payload = {
        iss: 'MyAutoLogger',        // issues of token - my application
        sub: user.username          // subject - token user
    };

    var token = jwt.sign(payload, tokens.secret);

    var response = {
        'username': user.username,
        'firstName': user.firstName,
        'lastName': user.lastName,
        'success': true,
        'message': 'Welcome, ' + client + '!',
        'token': token
    };



    console.log('Token issued to: ' + client);

    return response;
}

// login routes
router.post('/login', passport.authenticate('local-login', {
    failureRedirect: '/login/fail'
}), function (req, res) {

    var response = makeLoginSuccessResponse(req.user);

    console.log('Token issued to: ' + req.user.username);

    // send response including token as JSON
    res.send(response);
});

router.get('/login/fail', function (req, res) {
    res.status(401).end('wrong username or password');
});
// login routes


// TODO: use Q promises to make control flow more concise?
//login via facebook routes
router.post('/login/facebook', function (req, res) {
    console.log('router.post(/login/facebook');

    // facebook login provides us with following fields
    // login_req.body.userID;
    // login_req.body.accessToken;

    // check if user exists by providing userID as username
    users.findOneByName(req.body.username, checkUserExists);
    function checkUserExists(err, user) {
        console.log('checkUserExists');

        if (err) return res.status(500).send(err);

        if (user) {

            // TODO: users.isPasswordValid will always fail
            // can not store tokens as password due to bCrypt length limitation of 55 bytes
            // checking non-hashed token against it's hash fails and this results in Facebook API query
            // to confirm token validity.
            //
            // As a workaround tokens can be stored non-hashed and simply checked for equality against
            // user-provided tokens like: var valid = req.body.password === user.password;

            users.isPasswordValid(user, req.body.password, function(err, valid) {
               if (err) return res.status(500).send(err);

                if (valid) {
                    console.log('isPasswordValid = true');

                    // user has valid token stored - no need to contact Facebook
                    // return login ok with user info

                    var response = makeLoginSuccessResponse(user);

                    return res.send(response);
                } else {
                    console.log('isPasswordValid = false');

                    // user provided token that is different from stored - contact Facebook to validate it
                    getFacebookProfile(req.body.password, function (err, facebookResponse) {

                        if (err) return res.status(500).send(err);

                        if (req.body.username !== facebookResponse.id) {
                            // token valid but does not belong to this userID
                            return res.status(401).send('Wrong AccessToken for provided userID');
                        }

                        // login or create new user for given facebook profile
                        var user = {
                            username: facebookResponse.id,
                            password: req.body.password,
                            firstName: facebookResponse.first_name,
                            lastName: facebookResponse.last_name
                        };

                        upsertUser(user, function (err, user) {
                            if (err) return res.status(500).send(err);
                            if (!user) return res.status(500).send('upsert user failed');

                            var response = makeLoginSuccessResponse(user);

                            res.send(response);
                        });
                    });

                }

            });
        } else {

            // accessToken from client is passed in password
            getFacebookProfile(req.body.password, function (err, facebookResponse) {

                // user not found - register with Facebook data
                if (err) return res.status(500).send(err);

                if (req.body.username !== facebookResponse.id) {
                    // token valid but does not belong to this userID
                    return res.status(401).send('Wrong AccessToken for provided userID');
                }

                // login or create new user for given facebook profile
                var user = {
                    username: facebookResponse.id,
                    password: req.body.password,
                    firstName: facebookResponse.first_name,
                    lastName: facebookResponse.last_name
                };

                upsertUser(user, function (err, user) {
                    if (err) return res.status(500).send(err);
                    if (!user) return res.status(500).send('upsert user failed');

                    var response = makeLoginSuccessResponse(user);

                    res.send(response);
                });
            });
        }
    }

});


// TODO: replace with by upsert method in users model?
function upsertUser(user, callback) {
    console.log('upsertUser');

    users.findOneByName(user.username, processFindOneResult);
    function processFindOneResult(err, foundUser) {
        console.log('processFindOneResult');

        if (err) return callback(err);

        if (foundUser) {
            console.log('processFindOneResult: user found');
            users.updateFacebook(foundUser, processUser);
        } else {
            console.log('processFindOneResult: no user');
            users.createFacebook(user, processUser);
        }

        function processUser(err, user) {
            console.log('processUser ' + JSON.stringify(user));
            if (err) return callback(err);

            return callback(null, user);
        }
    }
}

function getFacebookProfile(accessToken, callback) {
    console.log('getFacbookProfile');

    // making Graph API call will validate token and get user profile
    var url = 'https://graph.facebook.com/me?fields=id,first_name,last_name&access_token=' + accessToken;

    var https_req = https.get(url);
    https_req.on('response', function (https_res) {

        https_res.on('data', function (chunk) {
            // parse chunk buffer into JSON
            var facebookResponse = JSON.parse(chunk);

            // handle facebook error
            if (!facebookResponse || facebookResponse.error) {

                var message = facebookResponse
                    ? facebookResponse.error
                    : 'Facebook response is ' + facebookResponse;

                return callback(message);
            }

            return callback(null, facebookResponse);
        });
    });

    https_req.on('error', function (error) {
        console.error(JSON.stringify(error.message));
        callback(error.message);
    });
}

//login via facebook routes

module.exports = router;