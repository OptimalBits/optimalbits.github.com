var express = require('express');
var http = require('http');
var crawlme = require('crawlme');

var app = express()
  .use(crawlme())
  .use(express.static(__dirname + '/public'));

var port = process.env['OPTIMALBITS_PORT'] || 8000;
console.log("Listening to port:"+port);
http.createServer(app).listen(port);

