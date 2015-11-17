'use strict';

var log = require('morgan');
var fs = require('fs');
var path = require('path');
var bCrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
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

users.create = function (username, password, callback) {

    // TODO: store passwords encrypted
    // TODO: use Salt for better security

    //console.log(bCrypt.hashSync(password, bCrypt.genSaltSync(10), null));
    //console.log(crypto.createHash('md5').update(password).digest('base64'));

    var user = {'username': username, 'password': password};

    users.findOneByName(username, processUser);

    function processUser(err, user) {

        if (err) return callback(err);

        // if user already exists - return null, null
        if (user) return callback(null, null);

        db.getCollection('users', insertUser);
    }

    function insertUser(err, collection) {
        if (err) return callback(err);

        collection.insert(user, processInsertUserResult);
        function processInsertUserResult(err) {
            if (err) return callback(err);

            console.log('user created: ', user.username);
            callback(null, user);
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


users.isValidPassword = function (user, password) {
    return password === user.password;
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
