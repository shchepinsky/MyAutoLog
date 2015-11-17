/**
 * Created by sdv on 11/12/15.
 */
var client = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = 'mongodb://localhost:27017/MyAutoLog';

var db = null;
module.exports = {
    getCollection: function(collectionName, callback) {
        if (!collectionName) {
            return callback('Collection name can not be empty');
        }

        if (db) {
            // reuse db connection
            connectResult(null, db);
        } else {
            // make new db connection
            client.connect(url, connectResult);
        }

        function connectResult(err, database) {
            if (err) {
                close();
                return callback(err);
            }

            db = database;
            // connect success, get collection
            db.collection(collectionName, processCollection);
            function processCollection(err, collection) {
                // notify caller with error if any and resulting connection
                callback(err, collection);

            }
        }
    },
    close: function() {
        try {
            if (db) {
                db.close();
            }
        } catch (ignored) {
            console.log(ignored);
        } finally {
            db = null;
        }
    }
};


