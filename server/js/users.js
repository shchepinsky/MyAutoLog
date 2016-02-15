'use strict';

var log = require('morgan');
var fs = require('fs');
var path = require('path');
var bCrypt = require('bcrypt-nodejs');
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
    console.log('findOneByName: ' + username);

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

    bCrypt.genSalt(10, function (err, salt) {
        if (err) return callback(err);

        bCrypt.hash(password, salt, null, function (err, hash) {
            if (err) return callback(err);

            callback(null, hash);
        });
    });
};

users.updateFacebook = function (user, callback) {
    console.log('updateFacebook');

    db.getCollection('users', processCollection);
    function processCollection(err, collection) {
        if (err) return callback(err);

        // search by unique username field
        var filter = {
            username: user.username
        };

        // insert new if not found
        var options = {
            upsert: true
        };

        collection.updateOne(filter, user, options, processUpdateOneResult);
        function processUpdateOneResult(err, opResult) {
            console.log('processUpdateOneResult: ' + JSON.stringify(opResult));

            if (err) return callback(err);

            return callback(null, user);
        }
    }

};

users.createFacebook = function (user, callback) {
    console.log('createFacebook');

    if (!user) throw new Error('user must be defined');
    if (!user.username) throw new Error('user.username must be defined');
    if (!user.password) throw new Error('user.password must be defined');

    users.findOneByName(user.username, processUserFindResult);
    function processUserFindResult(err, existingUser) {
        console.log('findOneByName');

        if (err) return callback(err);

        // if user already found
        if (existingUser) return callback(null, null);

        // no user found - add new
        db.getCollection('users', processUsersCollection);
        function processUsersCollection(err, collection) {
            console.log('processUsersCollection');

            if (err) return callback(err);

            users.createHash(user.password, processHash);
            function processHash(err, hash) {
                if (err) return callback(err);

                // TODO: we can not store tokens hashed by bCrypt due to size limitations?
                user.password = hash;

                collection.insertOne(user, processInsertOneResult);
                function processInsertOneResult(err, opResult) {
                    console.log('processInsertOneResult');

                    if (err) return callback(err);

                    console.log(opResult);

                    callback(null, user);
                }
            }
        }
    }
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
    console.log('findOneByID');

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
