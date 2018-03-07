const { Writable, Readable, Duplex, Transform } = require('stream');
const fs = require('fs');

// print process.argv
// doing this now so that I can work on it in the future
let j = 1;
for(let i = 2; i < process.argv.length; i++){
  console.log(`${j}: ${process.argv[i]}`);
  j++;
}

// Object containing all of the information we care about
let statObject = {
  "start_time": Date.now(),
  "end_time": Date.now(),
  "elapsed_time": 0,
  "total_length_in_bytes": 0,
  "total_lines": 0,
  "throughput": 0,
};

// create source and destination for the duplex
let source = fs.createReadStream('example.txt');
let destination = fs.createWriteStream('object.txt');

// on reception of data from file
source.on('data', (chunk) => {
  statObject.start_time = Date.now();
  console.log('Reading %d characters of string data', chunk.length);
  statObject.total_length_in_bytes += chunk.length;
  let dataString = chunk.toString();
  let split_lines = dataString.split("\n");
  statObject.total_lines += split_lines.length - 1;
});

source.on('end', function () {
  source.pipe(destination);
});

destination.on('error', function(error) {
  console.log("Woops! An error occurred:", error);
})

destination.on('pipe', (src) => {
  statObject.end_time = Date.now();
  statObject.elapsed_time = (statObject.end_time - statObject.start_time) / 1000;
  statObject.throughput = statObject.total_length_in_bytes / statObject.elapsed_time;
  destination.write(`{
    "elapsed_time": ${statObject.elapsed_time},
    "total_length_in_bytes": ${statObject.total_length_in_bytes},
    "total_lines": ${statObject.total_lines}}`);
  destination.end();
});

destination.on('finish', () => {
  console.log('All writes are now complete.');

  let objectSource = fs.createReadStream("object.txt");
  let objectDestination = fs.createWriteStream("throughput.txt");
  let object = statObject;

  objectSource.on('data', (chunk) => {
    object = JSON.parse(chunk);
  });

  objectSource.on('end', function () {
    objectSource.pipe(objectDestination);
  });

  objectDestination.on('error', function(error) {
    console.log("Woops! An error occurred:", error);
  });

  objectDestination.on('pipe', (src) => {
    let output = object.total_length_in_bytes / object.elapsed_time;
    console.log(`Throughput is currently ${output} bytes/second`);
    objectDestination.end();
  });

  objectDestination.on('finish', () => {
    console.log('Everything is finished.');
  });
});
