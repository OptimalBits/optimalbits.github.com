define(['jquery', 'underscore', 'ginger/ginger','showdown'], function($, _, ginger, showdown){

$(function(){

ginger.route.root = '/'

ginger.route.listen(function(req){
  req.get(function(){
  
    req.anim('fadeOut').render('/jade/main.jade', '/css/main.css').anim('fadeIn');
  
    if(req.isLast()){
      req.redirect('/news');
      return;
    }
    
    req.get('news', '#content', function(){
      curl(['text!/data/news.json'], function(d){
        var data = JSON.parse(d);
            urls = _.pluck(data, 'url');
        if(req.isLast()){
          req.anim('fadeOut');
          req.load(urls, function (done){
            for(var i=0, len=req.data.length;i<len;i++){
              data[i].content = showdown.parse(req.data[i]);
              data[i].url = req.resourceRoute(data[i].url);
            }
            req.data = data;
            done();
          });
          req.render('/jade/news.jade', '/css/news.css', 'news');
          req.anim('fadeIn');
        }else{
          req.get(':id', '#content', function() {
            var docUrl = '/data/news/'+req.params.id+'.json'
            req.anim('fadeOut');
            req.load(docUrl, function(done){
              for(var i=0, len=data.length;i<len;i++){
                if(data[i].url===docUrl){
                  data[i].content = showdown.parse(req.data)
                  data[i].url = req.url;
                  req.data = data[i];
                  break;
                }
              }
              done();
            });
            req.render('/jade/news-detail.jade', '/css/news.css', 'doc');
            req.anim('fadeIn');
          });
        }
      });
    });

    // About
    req.get('about', '#content', function(){
      req.anim('fadeOut').render('/jade/about.jade').anim('fadeIn');
    });
      
    // Products
    req.get('products', '#content', function(){
    
      // render submenu.
    
      req.get('castmill','#content', function(){
        req.anim('fadeOut').render('/jade/products/castmill.jade').anim('fadeIn');
      });
         
      req.get('ginger', '#content', function(){
        req.anim('fadeOut').render('/jade/products/ginger.jade').anim('fadeIn');
      });
    });
      
    // Career
    req.get('career', '#content', function(){
      req.anim('fadeOut').render('/jade/career.jade').anim('fadeIn');
    });
      
    // Contact
    req.get('contact', '#content', function(){
      req.anim('fadeOut').render('/jade/contact.jade').anim('fadeIn');
    });
    
  })
});
});
  
});
