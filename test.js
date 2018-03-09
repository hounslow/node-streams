const {writer, objectTransform} =  require('./new-attempt.js');
const fs = require('fs');

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

let source = fs.createReadStream('test.txt');
source.pipe(objectTransform).pipe(writer);

writer.on('finish', () => {
  console.log(statObject.totalLines);
})
