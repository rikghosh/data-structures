
var fs = require('fs');

var meetings01 = JSON.parse(fs.readFileSync('meetingsData/meetingsDatam01.txt'));
var meetings02 = JSON.parse(fs.readFileSync('meetingsData/meetingsDatam02.txt'));
var meetings03 = JSON.parse(fs.readFileSync('meetingsData/meetingsDatam03.txt'));
var meetings04 = JSON.parse(fs.readFileSync('meetingsData/meetingsDatam04.txt'));
var meetings05 = JSON.parse(fs.readFileSync('meetingsData/meetingsDatam05.txt'));
var meetings06 = JSON.parse(fs.readFileSync('meetingsData/meetingsDatam06.txt'));
var meetings07 = JSON.parse(fs.readFileSync('meetingsData/meetingsDatam07.txt'));
var meetings08 = JSON.parse(fs.readFileSync('meetingsData/meetingsDatam08.txt'));
var meetings09 = JSON.parse(fs.readFileSync('meetingsData/meetingsDatam09.txt'));
var meetings10 = JSON.parse(fs.readFileSync('meetingsData/meetingsDatam10.txt'));


// Connection URL
// var url = 'mongodb://' + process.env.IP + ':27017/aa';
var url = process.env.ATLAS;

// Retrieve
var MongoClient = require('mongodb').MongoClient; // npm install mongodb

MongoClient.connect(url, function(err, db) {
    if (err) {return console.dir(err);}

    var collection = db.collection('meetings');

    // THIS IS WHERE THE DOCUMENT(S) IS/ARE INSERTED TO MONGO:
    collection.insert(meetings01);
    collection.insert(meetings02);
    collection.insert(meetings03);
    collection.insert(meetings04);
    collection.insert(meetings05);
    collection.insert(meetings06);
    collection.insert(meetings07);
    collection.insert(meetings08);
    collection.insert(meetings09);
    collection.insert(meetings10);
    db.close();

}); //MongoClient.connect