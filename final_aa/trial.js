var fs = require('fs');

var collName = 'meetings';

// Connection URL
var url = process.env.ATLAS;

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        
        var dateTimeNow = new Date();
        var today = dateTimeNow.getDay();
        var tomorrow;
        if (today == 6) {tomorrow = 0;}
        else {tomorrow = today + 1}
        var hour = dateTimeNow.getHours();
        
        // convert numerical days to words
        var todayWord = days[today];
        var tomorrowWord = days[tomorrow];

var myQuery = [
    
    { $unwind : "$meetingsInfo" },
            { $match : 
                { $or : [
                    { $and: [ 
                        { "meetingsInfo.day" : todayWord } , { "meetingsInfo.starthour" : { $gte : hour } }
                    ]},
                    { $and: [
                        { "meetingsInfo.day" : tomorrowWord } , { "meetingsInfo.starthour" : { $lte : 4 } }
                    ]}
                ]}
            },
            
            // group by meeting group
            { $group : { _id : {
                latLong : "$locationInfo.latLong",
                meetingName : "$meetingName",
                meetingAddress : "$locationInfo.formattedAddress",
                meetingWheelchair : "$wheelchair",
                },
                    meetingDay : { $push : "$meetingsInfo.day" },
                    meetingStartTime : { $push : "$meetingsInfo.start" }, 
                    meetingType : { $push : "$meetingsInfo.type" }
            }
            },
            
            // group meeting groups by latLong
            {
                $group : { _id : { 
                    latLong : "$_id.latLong"},
                    meetingGroups : { $push : {groupInfo : "$_id", meetingDay : "$meetingDay", meetingStartTime : "$meetingStartTime", meetingType : "$meetingType" }}
                }
            }
    
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
