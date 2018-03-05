const { Writable, Readable, Duplex } = require('stream');
const fs = require('fs');

Duplex.Readable = fs.createReadStream('example.txt');
Duplex.Writable = fs.createWriteStream('objects.txt');

// print process.argv
// doing this now so that I can work on it in the future
let j = 1;
for(let i = 2; i < process.argv.length; i++){
  console.log(`${j}: ${process.argv[i]}`);
  j++;
}

let statObject = {
  "start_time": Date.now(),
  "end_time": Date.now(),
  "elapsed_time": 0,
  "total_length_in_bytes": 0,
  "total_lines": 0,
  "throughput": 0,
};

Duplex.Readable
  .on('data', function (chunk) {
    statObject.start_time = Date.now();
    statObject.total_length_in_bytes += chunk.length;
    let dataString = chunk.toString();
    let split_lines = dataString.split("\n");
    statObject.total_lines += split_lines.length - 1;
  })
  .on('end', function () {
    statObject.end_time = Date.now();
    statObject.elapsed_time = (statObject.end_time - statObject.start_time) / 1000;
    statObject.throughput = statObject.total_length_in_bytes / statObject.elapsed_time;
    Duplex.Writable.write(
      `Elapsed Time: ${statObject.elapsed_time}s
      Total Length in Bytes: ${statObject.total_length_in_bytes}
      Total Lines: ${statObject.total_lines}
      Throughput: ${statObject.throughput} bytes/second`);
  });

Duplex.Readable.pipe(process.stdout);
