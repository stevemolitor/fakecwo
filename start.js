var fs = require('fs');
var http = require('http');
var path = require('path');

var LATENCY = 10;

var cache = {};

function sendFile(file, res) {
  res.writeHead(200);

  if (cache[file]) {
    return setTimeout(function () {
      res.end(cache[file]);
    });
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

http.createServer(function (req, res) {
  if (req.url.match(/\.html$/)) {
    sendFile(path.resolve(__dirname, 'file.html'), res);
  } else {
    sendFile(path.resolve(__dirname, 'file.txt'), res);
  }
}).listen(3000);
