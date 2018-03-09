const { Writable, Transform, Readable } = require('stream');
const fs = require('fs');

let j = 1;
for(let i = 2; i < process.argv.length; i++){
  console.log(`${j}: ${process.argv[i]}`);
  j++;
}

let sourcePath = 'example.txt'

// create the source file
let source = fs.createReadStream(sourcePath);

// Object containing all of the information we care about
let statObject = {
  "startTime": process.hrtime(),
  "timeInSeconds": 0,
  "elapsedTime": 0,
  "totalBytes": 0,
  "currentByteCount": 0,
  "totalLines": 0,
  "throughput": 0,
};

const objectTransform = new Transform({
  readableObjectMode: true,
  transform(chunk, encoding, error) {
    let diff = process.hrtime(statObject.startTime);
    statObject.currentByteCount = chunk.length;
    statObject.totalBytes += chunk.length;
    statObject.timeInSeconds = (diff[0] *  1000) + (diff[1] / 1000000);
    statObject.elapsedTime = statObject.timeInSeconds;

    let split_lines = chunk.toString().split("\n");
    statObject.totalLines += split_lines.length - 1;
    this.push(statObject);
    error();
  },
});

const writer = new Writable({
  objectMode: true,
  write(chunk, encoding, error) {
    statObject.throughput = statObject.currentByteCount / statObject.timeInSeconds;
    console.log(`total bytes read: ${statObject.totalBytes} bytes, total lines: ${statObject.totalLines}, throughput: ${statObject.throughput} bytes/millisecond, total elapsed time: ${statObject.elapsedTime} milliseconds`);
    error();
  },
})

source.pipe(objectTransform).pipe(writer);
