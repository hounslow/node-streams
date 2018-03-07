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
  transform(chunk, encoding, error) {
    console.log('Reading %d characters of string data', chunk.length);
    statObject.endTime = Date.now();
    statObject.totalLengthInBytes += chunk.length;
    statObject.elapsedTime += (statObject.endTime - statObject.startTime) / 1000;
    let dataString = chunk.toString();
    let split_lines = dataString.split("\n");
    statObject.totalLines += split_lines.length - 1;
    this.push(statObject);
    error();
  },
});

const writer = new Writable({
  objectMode: true,
  write(chunk, encoding, callback) {
    statObject.throughput = statObject.totalLengthInBytes / statObject.elapsedTime;
    console.log(`Total read lines: ${statObject.totalLengthInBytes}, throughput: ${statObject.throughput}, total elapsed time: ${statObject.elapsedTime}`);
    callback();
  },
})

source.pipe(objectTransform).pipe(writer);
