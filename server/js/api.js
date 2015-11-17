'use strict';

var path = require('path');
var fs = require('fs');
var express = require('express');
var jwt = require('express-jwt');
var tokens = require('./tokens');
var logs = require('./logs');

var router = express.Router();

// protect entire /api branch with token
router.use('/api', jwt({secret: tokens.secret}), function(req, res, next) {

    if (!req.user) {
        var message = 'Token required for access! Please log in first!';
        console.log('API: ' + message);
        return res.status(401).send(message);
    }

    console.log('API: ' + req.user.sub + ' has valid token');
    next();
});

router.get('/api/log', function (req, res) {
    // find username in req.user.sub
    // get log database using username.log
    // respond with all log entries

    logs.getUserLog(req.user.sub, processLog);
    function processLog(err, log) {
        if (err) return res.status(500).send(err);

        res.send(log);
    }

});

router.post('/api/log', function (req, res) {
    // find username in req.user.sub
    // make database log name using username.log
    // upsert event into database

    logs.postUserLog(req.user.sub, req.body, processPostResult);
    function processPostResult(err, opResult) {
        if (err) return res.status(500).send(err);

        res.send(opResult.insertedId.toHexString());
    }
});

router.get('/api/vehicle', function (req, res) {
    // find username in req.user.sub
    // get log database using username.log
    // respond with all log entries

    logs.getUserVehicleData(req.user.sub, processVehicleData);
    function processVehicleData(err, vehicleData) {
        if (err) return res.status(500).send(err);

        res.send(vehicleData);
    }

});

router.post('/api/vehicle', function (req, res) {
    // find username in req.user.sub
    // make database log name using username.log
    // upsert event into database

    logs.postUserVehicleData(req.user.sub, req.body, processPostResult);
    function processPostResult(err, opResult) {
        if (err) return res.status(500).send(err);

        res.send("Modified vehicle data: " + opResult.modifiedCount);
    }
});

module.exports = router;

