'use strict';

var log = require('morgan');
var fs = require('fs');
var path = require('path');
var bCrypt = require('bcrypt');
var ObjectId = require('mongodb').ObjectId;
var db = require('./db');

var users = {};
module.exports = users;

users.remove = function (id) {

    db.getCollection('users', processUsersCollection);

    function processUsersCollection(err, collection) {
        if (err) return console.log(err);


        collection.remove({_id: id}, removeCallback);
    }

    function removeCallback(err) {
        if (err) {
            console.log(err);
        } else {
            console.log('user deleted ', +id);
        }
    }
};

users.findOneByName = function (username, callback) {

    db.getCollection('users', processUsersCollection);
    function processUsersCollection(err, collection) {

        if (err) return callback(err);

        function processFindResult(err, user) {
            if (err) return callback(err);

            return callback(null, user);
        }

        collection.find({username: username}).next(processFindResult);
    }
};

users.isPasswordValid = function (user, password, callback) {
    // password arrives in clear text, but stored in hashed form
    bCrypt.compare(password, user.password, callback);
};

users.createHash = function (password, callback) {

    // TODO: store passwords encrypted
    // TODO: use Salt for better security

    bCrypt.genSalt(10, function (err, salt) {
        if (err) return callback(err);

        bCrypt.hash(password, salt, function (err, hash) {
            if (err) return callback(err);

            callback(null, hash);
        });
    });
};

users.create = function (username, password, callback) {

    users.findOneByName(username, processUser);

    function processUser(err, user) {

        if (err) return callback(err);

        // if user already exists - return null, null
        if (user) return callback(null, null);

        db.getCollection('users', processUsersCollection);
    }

    function processUsersCollection(err, collection) {
        if (err) return callback(err);

        users.createHash(password, processHash);
        function processHash(err, hash) {
            if (err) return callback(err);

            var user = {'username': username, 'password': hash};

            collection.insert(user, processInsertUserResult);
            function processInsertUserResult(err) {
                if (err) return callback(err);

                console.log('user created: ', user.username);
                callback(null, user);
            }
        }

    }



};

users.findOneByID = function (id, callback) {

    id = new ObjectId(id);

    db.getCollection('users', processUsersCollection);

    function processUsersCollection(err, collection) {
        if (err) return callback(err);

        var cursor = collection.find({_id: id}).limit(1);

        cursor.next(function (err, user) {
            if (err) {
                callback(err);
            } else {
                callback(null, user);
            }
        });

    }
};

users.usernameObeysPolicy = function (username) {
    return (username && username.length > 2);
};

users.passwordObeysPolicy = function (password) {
    return (password && password.length > 2);
};

users.serializeUser = function (user, done) {
    var serialized = user._id;
    done(null, serialized);
};

users.deserializeUser = function (id, done) {
    users.findOneByID(id, processResult);

    function processResult(err, user) {
        if (err) {
            done(err, null);
        } else {
            done(null, user);
        }
    }
};
