let fastCSV = require('fast-csv');
let fs = require('fs');
let request = require('request');
let options = {
  flags: 'r', //what is this option for... arent we just reading?
  autoClose: true,
};

let fileReadStream = fs.createReadStream("data.csv", options);
let fileWriteStream = fs.createWriteStream("file-with-data.csv"); //default options is fine

// ----- This is some code that doesnt use the fast-csv module for fun -----//
/*
fileStream
  .on('data', (data) => {
    var textChunk = data.toString('utf8');
    console.log("nontransformed ", textChunk);
    fileStream.pause();
  })
  .on('end', () => {
    console.log('parsing is complete');
  });
*/


// ----- Read from files and then send requests async  ------ //
const url = 'https://freegeoip.net/';
const format = 'csv';


//http://stackoverflow.com/questions/4460586/javascript-regular-expression-to-check-for-ip-addresses
let isValidIP = function(ip) {
  if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) {  
    return true;
  }  
  alert("You have entered an invalid IP address!")  ;
  return false;
};

let sendReq = function(ip, next) {
  //TODO: transform to es6 literals
  request('https://www.freegeoip.net/' + format + '/'+ ip, (error, response, body) => {
    //success
    if (!error && response.statusCode == 200) {
      console.log(body);
    }
    next(body);
  });
};

fastCSV
  .fromStream(fileReadStream, {headers: true})
  .validate((data) => {
    return isValidIP(data.IPAddress);
  })
  .on('data', (data) => {
    sendReq(data.IPAddress, () => {
    });
  })
  .on('data-invalid', (row) => {
    console.log("invalid data detected... stopping execution");
    console.log("invalid row:", row);
    fileReadStream.pause(); //stop execution here
  })
  .on('end', () => {
    console.log("done converting IPs to Locations") ;
  });

// ----- Take the output and write into a new file ------- //





