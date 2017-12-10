var express = require('express'),
    app = express();
var fs = require('fs');

// Postgres
const { Pool } = require('pg');
var db_credentials = new Object();
db_credentials.user = 'rikghosh';
db_credentials.host = process.env.AWSRDS_EP;
db_credentials.database = 'datastructures';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

// Mongo
var collName = 'meetings';
var MongoClient = require('mongodb').MongoClient;
var url = process.env.ATLAS;

// HTML wrappers for AA data
var index1 = fs.readFileSync("index1.txt");
var index3 = fs.readFileSync("index3.txt");

app.get('/', function(req, res) {
    // Connect to the AWS RDS Postgres database
    const client = new Pool(db_credentials);

    // SQL query
    var q = `SELECT EXTRACT(MINUTE FROM time AT TIME ZONE 'America/New_York') as minute,
                EXTRACT(HOUR FROM time AT TIME ZONE 'America/New_York') as hour, 
                EXTRACT(DAY FROM time AT TIME ZONE 'America/New_York') as day,
                EXTRACT(MONTH FROM time AT TIME ZONE 'America/New_York') as month,
                count(*) as num_obs,
                max(irstatus) as walked_past,
                round(avg(force)) as water_amount
                FROM fsrData LEFT OUTER JOIN irData USING (time)
                GROUP BY month, day, hour, minute;`;
             
    client.connect();
    client.query(q, (qerr, qres) => {
        res.send(qres.rows);
        console.log('responded to request');
    });
    client.end();
});

app.get('/aa', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) {return console.dir(err);}
        
        // create array to convert numerical days
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
        
        const myDB = db.db('rik');

        var collection = myDB.collection(collName);
        
        
        collection.aggregate([ // start of aggregation pipeline
            // match by day and time
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
        
            ]).toArray(function(err, docs) { // end of aggregation pipeline
            
            if (err) {console.log(err)}
            
            else {
                res.writeHead(200, {'content-type': 'text/html'});
                res.write(index1);
                res.write(JSON.stringify(docs));
                res.end(index3);
            }
            db.close();
        });
    });
    
});

// app.listen(process.env.PORT, function() {
app.listen(4000, function() {
    console.log('Server listening...');
});
