var request = require('request'); // npm install request
var async = require('async'); // npm install async
var fs = require('fs');
var cheerio = require('cheerio');


// SETTING ENVIRONMENT VARIABLES (in Linux): 
// export NEW_VAR="Content of NEW_VAR variable"
// printenv | grep NEW_VAR
var apiKey = process.env.GMAKEY;

// var zones = ['m01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10'];

var zones = ['m10'];

for (let zone of zones) {
    parse(zone);
}

function parse(zone) {
    // initialize variables
    var meetingNames = []; // to store names of meetings
    var buildingNames = []; // to store names of buildings in which meetings are held
    var locations = []; // to store scraped location data
    // var locationData = []; // to store formatted location data from the Google Maps API
    var wheelchairs = []; // to store wheelchair access data
    var times = []; // to store times and extra information about individual meetings
    var combinedData = []; // final array to store all cleaned data together
    
    // load website to scrape
    var content = fs.readFileSync('aapages/' + zone + '.txt');
    
    // load `content` into a cheerio object
    var $ = cheerio.load(content);
    
    // scrape website and add info to arrays
    $('table table table tbody').find('tr').each(function(i, elem) {
         //addresses.push($(elem).find('td').first().html().split('<br>')[2].replace('NY 10032','').replace('NY 10033','').trim());
         $(elem).find('td').first().each(function(i, elem) {
             // get meeting names
             meetingNames.push($(elem).find('b').text());
             // get building names
             buildingNames.push($(elem).find('h4').text());
             // get locations
             locations.push($(elem).html().split('<br>')[2].replace('NY 10032', '').replace('NY 10033', '').trim());
             // get wheelchair info
             wheelchairs.push($(elem).find('span').text().trim());
         });
         // get times and other info
         $(elem).find('td').eq(1).each(function(i, elem) {
             times.push($(elem).contents().text().trim());
         });
    });
    
    // clean meeting names
    for (var i in meetingNames) {
        meetingNames[i] = meetingNames[i].split(' - ')[0];
    };
    
    // clean building names
    for (var i in buildingNames) {
        if (buildingNames[i] == '') {
            buildingNames[i] = 'No Name';
        }
    };
    
    // clean wheelchair access
    for (var i in wheelchairs) {
        if (wheelchairs[i] == '') {
            wheelchairs[i] = 'Unavailable';
        }
        else {
            wheelchairs[i] = 'Available';
        }
    };
    
    // clean meeting information
    for (var i in times) {
        times[i] = times[i].replace(/[ \t]+/g, ' ');
        times[i] = times[i].replace(/[ \n]/g, ' ');
        times[i] = times[i].replace('        ', ';');
        times[i] = times[i].replace('         ', ';');
        times[i] = times[i].replace('        ', ';');
        times[i] = times[i].replace('         ', ';');
        times[i] = times[i].split(';')
        for (var j in times[i]) {
            times[i][j] = times[i][j].trim();
        };
    };
    
    // format meeting information using function below
    for (var i in times) {
        times [i] = formatTimes(times[i]);
    };
    
    // clean locations and send to Google Maps API to retrieve information
    for (var i in locations) {
        locations[i] = locations[i].split(',')[0];
        locations[i] = locations[i] + ', New York, NY';
    }
    
    
    
    
    
    // combine data in final array (can iterate over any of the variables)
    for(var i in meetingNames) {
        var currentMeeting = new Object;
        currentMeeting.meetingName = meetingNames[i];
        currentMeeting.buildingName = buildingNames[i];
        currentMeeting.address = locations[i]; // temporary storage of unformatted address to feed into Google Maps API
        currentMeeting.locationInfo = []; // empty array to store results from Google Maps API
        currentMeeting.wheelchair = wheelchairs[i];
        currentMeeting.meetingsInfo = times[i];
        combinedData.push(currentMeeting);
    }
    
    // send addresses to Google Maps API, add improved location info to final array, and write array to file
    async.eachSeries(combinedData, function(value, callback) {
        var apiRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + value.address.split(' ').join('+') + '&key=' + apiKey;
        var thisMeeting = new Object;
        // thisMeeting.address = value;
        request(apiRequest, function(err, resp, body) {
            if (err) {throw err;}
            thisMeeting.latLong = JSON.parse(body).results[0].geometry.location;
            thisMeeting.formattedAddress = JSON.parse(body).results[0].formatted_address;
            value.locationInfo.push(thisMeeting);
            delete value.address;
        });
        setTimeout(callback, 100);
    }, function() {
        console.log(combinedData);
        fs.writeFileSync('meetingsData/meetingsData' + zone + '.txt', JSON.stringify(combinedData));
        
    });
    
    
    // function to format meeting information
    function formatTimes(meetingsInfo) {
        var output = [];
        for (var j in meetingsInfo) {
            var thisMeetingInfo = new Object;
            // store key indices
            var fromIndex = meetingsInfo[j].indexOf(meetingsInfo[j].match('From'));
            var toIndex = meetingsInfo[j].indexOf(meetingsInfo[j].match('to'));
            var meetingIndex = meetingsInfo[j].indexOf(meetingsInfo[j].match('Meeting'));
            var typeIndex = meetingsInfo[j].indexOf(meetingsInfo[j].match('Type'));
            var specialIndex = meetingsInfo[j].indexOf(meetingsInfo[j].match('Special'));
            var interestIndex = meetingsInfo[j].indexOf(meetingsInfo[j].match('Interest'));
            
            // organize information in an object
            thisMeetingInfo.day = meetingsInfo[j].slice(0, fromIndex).trim().slice(0, -1);
            thisMeetingInfo.start = meetingsInfo[j].slice(fromIndex + 4, toIndex).trim();
            // military time
            if (thisMeetingInfo.start[thisMeetingInfo.start.length - 2] == 'P' && thisMeetingInfo.start.slice(0, 2) != '12') {
                thisMeetingInfo.starthour = parseInt(thisMeetingInfo.start.slice(0, 2)) + 12;
            }
            else {
                if (thisMeetingInfo.start[thisMeetingInfo.start.length - 2] == 'A' && thisMeetingInfo.start.slice(0,2) == '12') {
                    thisMeetingInfo.starthour = 0;
                }
                else {
                thisMeetingInfo.starthour = parseInt(thisMeetingInfo.start.slice(0,2));
                }
            }
            thisMeetingInfo.startmin = parseInt(thisMeetingInfo.start.slice(-5, -3));
            thisMeetingInfo.end = meetingsInfo[j].slice(toIndex + 2, meetingIndex).trim();
            if (thisMeetingInfo.end[thisMeetingInfo.end.length - 2] == 'P' && thisMeetingInfo.end.slice(0, 2) != '12') {
                thisMeetingInfo.endhour = parseInt(thisMeetingInfo.end.slice(0, 2)) + 12;
            }
            else {
                if (thisMeetingInfo.end[thisMeetingInfo.end.length - 2] == 'A' && thisMeetingInfo.end.slice(0,2) == '12') {
                    thisMeetingInfo.endhour = 0;
                }
                else {
                thisMeetingInfo.endhour = parseInt(thisMeetingInfo.end.slice(0,2));
                }
            }
            thisMeetingInfo.endmin = parseInt(thisMeetingInfo.end.slice(-5, -3));
            thisMeetingInfo.type = meetingsInfo[j].slice(typeIndex + 5, typeIndex + 7);
            if (meetingsInfo[j].includes('Interest')) {
                thisMeetingInfo.type = meetingsInfo[j].slice(typeIndex + 9, specialIndex).trim();
                thisMeetingInfo.specialInterest = meetingsInfo[j].slice(interestIndex + 8, meetingsInfo[j].length).trim();
            }
            else {
                thisMeetingInfo.type = meetingsInfo[j].slice(typeIndex + 9, meetingsInfo[j].length).trim();
            }
            
            // add completed object to array
            output.push(thisMeetingInfo);
        }
        return output;
    }
}