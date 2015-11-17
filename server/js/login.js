var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('jsonwebtoken');
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


// login routes
router.post('/login', passport.authenticate('local-login', {
    failureRedirect: '/login/fail'
}), function (req, res) {
    // return response with token
    var payload = {
        iss: 'MyAutoLogger',        // issues of token - my application
        sub: req.user.username         // subject - token user
    };

    var token = jwt.sign(payload, tokens.secret);

    var response = {
        username: req.user.username,
        success: true,
        message: 'Welcome, ' + req.user.username + '!',
        token: token
    };

    // send response including token as JSON
    res.send(response);

    console.log('Token issued to: ' + req.user.username);
});

router.get('/login/fail', function (req, res) {
    res.status(401).end('wrong username or password');
});
// login routes


module.exports = router;