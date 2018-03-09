const {objectTransform, writer} =  require('./streams.js');
const fs = require('fs');

let sourcePath = 'test.txt';
let source = fs.createReadStream(sourcePath);
let destination = fs.createWriteStream("logtest.txt");

writer.on('pipe', (src) => {
  console.log(src === objectTransform);
});

source.pipe(objectTransform).pipe(writer);
