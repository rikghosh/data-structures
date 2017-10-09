// npm install mongodb

var request = require('request');
var fs = require('fs');

// First create database and collection in Mongo:
// use aanew
// db.createCollection('meetings')

var dbName = 'aanew'; // name of Mongo database (created in the Mongo shell)
var collName = 'meetings'; // name of Mongo collection (created in the Mongo shell)


// Insert the list of meetings in the Mongo collection

    var meetingsData = JSON.parse(fs.readFileSync('meetingsData.txt'));

    // Connection URL
    var url = 'mongodb://' + process.env.IP + ':27017/' + dbName;

    // Retrieve
    var MongoClient = require('mongodb').MongoClient; 

    MongoClient.connect(url, function(err, db) {
        if (err) {return console.dir(err);}

        var collection = db.collection(collName);

        collection.insert(meetingsData);
        db.close();

    }); //MongoClient.connect
