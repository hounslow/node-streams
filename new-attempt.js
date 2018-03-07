const { Writable, Transform, Readable } = require('stream');
const fs = require('fs');

// create the source file
let source = fs.createReadStream('example.txt');

// Object containing all of the information we care about
let statObject = {
  "startTime": Date.now(),
  "endTime": Date.now(),
  "elapsedTime": 0,
  "totalLengthInBytes": 0,
  "totalLines": 0,
  "throughput": 0,
};

const objectTransform = new Transform({
  readableObjectMode: true,
  // writableObjectMode: true,
  transform(chunk, encoding, error) {
    console.log('Reading %d characters of string data', chunk.length);
    let currentTime = Date.now();
    statObject.totalLengthInBytes += chunk.length;
    statObject.elapsed_time = (statObject.start_time - currentTime) / 1000;
    let dataString = chunk.toString();
    let split_lines = dataString.split("\n");
    statObject.total_lines += split_lines.length - 1;
    this.push(statObject);
    error();
  },
});

const writer = new Writable({
  objectMode: true,
  write(chunk, encoding, callback) {
    statObject.throughput = statObject.totalLengthInBytes / statObject.elapsedTime;
    console.log(chunk);
    callback();
  },
})

source.pipe(objectTransform).pipe(writer);
