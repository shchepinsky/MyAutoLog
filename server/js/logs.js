"use strict";

var ObjectId = require('mongodb').ObjectId;
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

        event.date = new Date(event.date);

        collection.insertOne(event, processInsertResult);

        function processInsertResult(err, opResult) {
            if (err) return callback(err);

            callback(null, opResult);
        }

    }
};

logs.putUserLog = function(username, event, callback) {

    db.getCollection(username + '.log', processCollection);

    function processCollection(err, collection) {
        if (err) {
            db.close();
            return callback(err);
        }

        if (!event._id || !ObjectId.isValid(event._id)) return callback('can not update event - no valid id provided');

        // reconstruct objects from string representation
        event._id = new ObjectId(event._id);
        event.date = new Date(event.date);

        var filter = { _id: event._id };

        collection.replaceOne(filter, event, processInsertResult);
        function processInsertResult(err, opResult) {
            if (err) return callback(err);

            callback(null, opResult);
        }

    }
};

logs.deleteLogEvent = function (username, event, callback) {
    db.getCollection(username + '.log', processCollection);

    function processCollection(err, collection) {
        if (err) {
            db.close();
            return callback(err);
        }

        // reconstruct objects from strings
        event._id = new ObjectId(event._id);

        if (event.date) {
            event.date = new Date(event.date);
        }

        collection.remove(event, processRemoveResult);
        function processRemoveResult(err, opResult) {
            if (err) {
                db.close();
                return callback(err);
            }

            callback(null, opResult);
        }
    }
};