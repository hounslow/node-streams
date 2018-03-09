const { Writable, Transform, Readable } = require('stream');
const fs = require('fs');

let j = 0;
let inputs = [];
for(let i = 2; i < process.argv.length; i++){
  inputs[j] = process.argv[i];
  j++;
}
let sourcePath = inputs[0] || 'example.txt';
let destinationPath = inputs[1] || 'logfile.txt';

// create the source file
let source = fs.createReadStream(sourcePath);
let destination = fs.createWriteStream(destinationPath, {flags: 'a'});

// Object containing all of the information we care about
let statObject = {
  "startTime": process.hrtime(),
  "elapsedTime": 0,
  "totalBytes": 0,
  "currentByteCount": 0,
  "totalLines": 0,
  "throughput": 0,
};

source.on('error', (error) => {
  console.log('An error occurred!');
  console.log(error);
})

const objectTransform = new Transform({
  readableObjectMode: true,
  transform(chunk, encoding, callback) {
    let diff = process.hrtime(statObject.startTime);
    statObject.timeInMilliSeconds = (diff[0] *  1000) + (diff[1] / 1000000);
    statObject.currentByteCount = chunk.length;
    statObject.totalBytes += chunk.length;
    statObject.elapsedTime = statObject.timeInMilliSeconds;
    let split_lines = chunk.toString().split("\n");
    statObject.totalLines += split_lines.length - 1;
    this.push(statObject);
    callback();
  },
});

const writer = new Writable({
  objectMode: true,
  write(chunk, encoding, callback) {
    statObject.throughput = statObject.currentByteCount / statObject.timeInMilliSeconds;
    console.log(`total bytes read: ${statObject.totalBytes} bytes, total lines: ${statObject.totalLines}, current throughput: ${statObject.throughput} bytes/millisecond, total elapsed time: ${statObject.elapsedTime} milliseconds`);
    callback();
  },
});

writer.on('error', (error) => {
  console.log("An error occurred while writing!");
  console.log(error);
});

writer.on('finish', () => {
  destination.write(`filename: ${sourcePath}, total bytes read: ${statObject.totalBytes} bytes, total lines: ${statObject.totalLines}, throughput: ${statObject.throughput} bytes/millisecond, total elapsed time: ${statObject.elapsedTime} milliseconds\n`);
  console.log('Finished.');
});

source.pipe(objectTransform).pipe(writer);

var exports = module.exports = {writer, objectTransform};
