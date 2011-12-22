define(['jquery', 'js!jade.js', 'js!sammy-0.7.0.min.js'], function($){

var jade = require('jade');
var fn = jade.compile("asd", {});

var app = $.sammy('#main', function() {
  this.get('#/', function(context) {
    curl(['text!/jade/main_menu.jade'], function(menu){
      var fn = jade.compile(menu);
      $(fn()).appendTo(context.$element());
    })
  });
});

$(function() {
  app.run('#/');
});

});
