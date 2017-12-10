var request = require('request'); // npm install request
var async = require('async'); // npm install async
var fs = require('fs');
var cheerio = require('cheerio');


// SETTING ENVIRONMENT VARIABLES (in Linux): 
// export NEW_VAR="Content of NEW_VAR variable"
// printenv | grep NEW_VAR
var apiKey = process.env.GMAKEY;

// initialize variables
var meetingNames = [];
var buildingNames = [];
var addresses = [];
var meetingsData = [];

// load the thesis text file into a variable, `content`
var content = fs.readFileSync('data/m10.txt');

// load `content` into a cheerio object
var $ = cheerio.load(content);

// scrape website to add addresses to array
$('table table table tbody').find('tr').each(function(i, elem) {
     addresses.push($(elem).find('td').first().html().split('<br>')[2].replace('NY 10032','').replace('NY 10033','').trim());
});

// keep only street address and add city and state
for (var i=0; i<addresses.length; i++) {
    addresses[i] = addresses[i].split(',')[0];
    addresses[i] = addresses[i] + ', New York, NY';
}

// eachSeries in the async module iterates over an array and operates on each item in the array in series
async.eachSeries(addresses, function(value, callback) {
    var apiRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + value.split(' ').join('+') + '&key=' + apiKey;
    var thisMeeting = new Object;
    // thisMeeting.address = value;
    request(apiRequest, function(err, resp, body) {
        if (err) {throw err;}
        thisMeeting.latLong = JSON.parse(body).results[0].geometry.location;
        thisMeeting.formattedAddress = JSON.parse(body).results[0].formatted_address;
        meetingsData.push(thisMeeting);
    });
    setTimeout(callback, 2000);
}, function() {
    console.log(meetingsData);
    // convert each object in array to string to save array to text file
    fs.writeFileSync('addresses.txt', JSON.stringify(meetingsData))
});


