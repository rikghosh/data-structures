var fs = require('fs');

var dbName = 'aanew';
var collName = 'meetings';

var meetingsData = JSON.parse(fs.readFileSync('meetingsData.txt'));

// Connection URL
var url = 'mongodb://' + process.env.IP + ':27017/' + dbName;

var myQuery = [
    
    { $unwind : "$meetingsInfo" },
    { $match : { "meetingsInfo.day" : "Tuesday" } },
    { $match: { $or : [ {"meetingsInfo.time" : /^7/}, {"meetingsInfo.time" : /^8/}, {"meetingsInfo.time" : /^9/}, {"meetingsInfo.time" : /^10/}, {"meetingsInfo.time" : /^11/}] } },
    { $match: { "meetingsInfo.time" : /PM/ } }
    
    ];

// Retrieve
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(url, function(err, db) {
    if (err) {return console.dir(err);}
    
    var collection = db.collection(collName);

    // Select three Citibike stations
    collection.aggregate(myQuery).toArray(function(err, docs) {
        if (err) {console.log(err)}
        
        else {
            console.log("Writing", docs.length, "documents as a result of this aggregation.");
            fs.writeFileSync('mongo_aggregation_result.JSON', JSON.stringify(docs, null, 4));
        }
        db.close();
        
    });

}); //MongoClient.connect
