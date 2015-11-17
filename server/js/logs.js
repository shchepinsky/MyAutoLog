"use strict";

var db = require('./db');
var logs = {};

module.exports = logs;

// TODO refactor model name and method names
logs.getUserVehicleData = function(username, callback) {

    db.getCollection('users', processCollection);

    function processCollection(err, collection) {
        if (err) {
            db.close();
            return callback(err);
        }

        var cursor = collection.find( { "username": username });

        cursor.next(processUser);
        function processUser(err, user) {
            if (err) return callback(err);

            callback(null, user.vehicle);
        }
    }
};

logs.postUserVehicleData = function(username, data, callback) {
    db.getCollection('users', processCollection);
    function processCollection(err, collection) {
        if (err) return callback(err);

        var cursor = collection.find( { "username": username });

        cursor.next(processUser);
        function processUser(err, user) {
            if (err) return callback(err);

            // restore Date objects from dates parsed by strings
            data.makeDate = new Date (data.makeDate);
            data.purchaseDate = new Date (data.purchaseDate);

            collection.updateOne(user, { $set: { vehicle : data } }, processUpdateResult);
            function processUpdateResult (err, opResult) {
                if (err) return callback(err);

                callback(null, opResult);
            }
        }
    }
};


logs.getUserLog = function(username, callback) {

    db.getCollection(username + '.log', processCollection);

    function processCollection(err, collection) {
        if (err) {
            db.close();
            return callback(err);
        }

        var log = {};

        var cursor = collection.find();

        cursor.forEach(processLogEntry, processEnd);

        function processLogEntry(doc) {
            var key = doc._id.toHexString();
            log[key] = doc;
        }

        function processEnd () {
            callback(null, log);
        }
    }
};

logs.postUserLog = function(username, event, callback) {

    db.getCollection(username + '.log', processCollection);

    function processCollection(err, collection) {
        if (err) {
            db.close();
            return callback(err);
        }

        collection.insertOne(event, processInsertResult);

        function processInsertResult(err, opResult) {
            if (err) return callback(err);

            callback(null, opResult);
        }

    }
};