// npm install cheerio

var fs = require('fs');
var cheerio = require('cheerio');

// load the thesis text file into a variable, `content`
var content = fs.readFileSync('data/m10.txt');

// load `content` into a cheerio object
var $ = cheerio.load(content);

// introduce addresses
console.log("The addresses are: \n");

// navigate to the relevant table and loop through each row
$('table table table tbody').find('tr').each(function(i, elem) {
     // get the html code from the relevant element of each row, exctract the address line, fix addresses with extra information, and trim whitespace
     // note: this page only had problems involving the two zipcodes below, but the replace method can be added for every new york zip code to ensure this works for other pages as well
     console.log($(elem).find('td').first().html().split('<br>')[2].replace('NY 10032','').replace('NY 10033','').trim());
});


