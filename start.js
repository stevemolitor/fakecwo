var fs = require('fs');
var http = require('http');
var path = require('path');
var cluster = require('cluster');
var os = require('os');

var numCpus = os.cpus().length;

var LATENCY = 10;

var cache = {};

function sendFile(file, res) {
  res.writeHead(200);

  if (cache[file]) {
    return res.end(cache[file]);
  }

  fs.readFile(file, function (err, data) {
    if (err) {
      res.writeHead(500, 'Internal Server Error');
      return res.end(err.toString());
    }

    cache[file] = data.toString();
    res.end(cache[file]);
  });
}

if (cluster.isMaster) {
  for (var i = 0; i < numCpus; i++) {
    cluster.fork();
  }
} else {
  console.log('child');
  http.createServer(function (req, res) {
    console.log('request');
    if (req.url.match(/\.html$/)) {
      sendFile(path.resolve(__dirname, 'file.html'), res);
    } else {
      sendFile(path.resolve(__dirname, 'file.txt'), res);
    }
  }).listen(process.env.PORT || 3000, function () {
    console.log('child listening');
  });
}
