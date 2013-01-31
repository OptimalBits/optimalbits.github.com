var express = require('express');
var http = require('http');
var crawlme = require('crawlme');

var app = express()
  .use(crawlme())
  .use(express.static(__dirname + '/public'));

http.createServer(app).listen(80);
