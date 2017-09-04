var request = require('request');
var fs = require('fs');

// create array of urls to loop through
let urls = ['http://visualizedata.github.io/datastructures/data/m01.html',  
'http://visualizedata.github.io/datastructures/data/m02.html',  
'http://visualizedata.github.io/datastructures/data/m03.html',  
'http://visualizedata.github.io/datastructures/data/m04.html',  
'http://visualizedata.github.io/datastructures/data/m05.html',  
'http://visualizedata.github.io/datastructures/data/m06.html',  
'http://visualizedata.github.io/datastructures/data/m07.html',  
'http://visualizedata.github.io/datastructures/data/m08.html', 
'http://visualizedata.github.io/datastructures/data/m09.html',  
'http://visualizedata.github.io/datastructures/data/m10.html'];

for (let url of urls) {
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
        // pull file name from url and create appropriately named text document
        fs.writeFileSync('/home/ubuntu/workspace/data/m' + url.slice(52,54) +'.txt', body);
        }
        else {console.error('request failed')}
    })
}
