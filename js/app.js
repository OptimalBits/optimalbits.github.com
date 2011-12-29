define(['jquery', 'ginger.route'], function($, ginger){

$(function(){

ginger.route.listen(function(context){
  context.get($('body'), function(){
  
    this.render('/jade/main.jade', function(){
      
      // News
      this.get('news', $('#content'), function(){
      
        if(this.isLast()){
          curl(['text!/data/news.json'], function(d){
            var data = JSON.parse(d);
            context.load(data.urls, function(news) {
              context.render('/jade/news.jade', '/css/news.css', {news:news});
            })  
          });
        }else{
          this.get(':id', $('content'), function() {
            
          
          });
        }
      });
      
      // About
      this.get('about', $('#content'), function(){
        this.render('/jade/about.jade');
      });
      
      // Products
      this.get('products', function(context){
        this.get('castmill', function(context){
        });
         
        this.get('ginger', function(context){
        });
      });
      
      // Career
      this.get('career', function(context){
      });
      
      // Contact
      this.get('contact', function(context){
      });
    })
  });
});
  
});

});




