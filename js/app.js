define(['jquery', 'ginger.route'], function($, ginger){

$(function(){

ginger.route.root = '/'

ginger.route.listen(function(req){
  req.get(function(req){
  
    if(req.isLast()){
      ginger.route.redirect('/news');
    }
    
    req.render('/jade/main.jade', '/css/main.css');
    
    req.get('news', '#content', function(req){
      if(req.isLast()){
        curl(['text!/data/news.json'], function(d){
          var data = JSON.parse(d);
          req.enter(function(req, done){
            req.$el.fadeOut('slow', done);
          })
          req.load(data.urls);
          req.render('/jade/news.jade', '/css/news.css', 'news', function(req, done){
            req.$el.fadeIn('slow', done);
          });  
        });
      }else{
        req.get(':id', '#content', function() {
          req.enter(function(req, done){
            req.$el.fadeOut('slow', done);
          })
          req.load('/data/news/'+req.params.id+'.json')
          req.render('/jade/news-detail.jade', '/css/news.css', 'doc', function(req, done){
            req.$el.fadeIn('slow', done);
          });
        });
      }
    });

    // About
    req.get('about', '#content', function(){
      req
      .enter(function(req, done){
        req.$el.fadeOut('slow', done);
      })
      .render('/jade/about.jade', function(req, done){
        req.$el.fadeIn('slow', done)
      });
    });
      
    // Products
    req.get('products', '#content', function(){
      req.get('castmill', function(){
      });
         
      req.get('ginger', function(){
      });
    });
      
    // Career
    req.get('career', '#content', function(){
    });
      
    // Contact
    req.get('contact', '#content', function(){
    });
    
  })
});
});
  
});
