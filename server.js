var express = require('express');
var http = require('http');
var crawlme = require('crawlme');

var app = express()
  .use(crawlme({
    cacheSize: 5*1024*1024,
    cacheRefresh: 15*60*1000 //every 15 minutes
  }))
  .use(express.static(__dirname + '/public'));

var port = process.env['OPTIMALBITS_PORT'] || 8000;
console.log("Listening to port:"+port);
http.createServer(app).listen(port);

