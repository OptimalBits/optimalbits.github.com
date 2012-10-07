define(['jquery', 
        'underscore',
        'ginger/route',
        'showdown',
        'js!jade.js',
        'js!moment.min.js'], function($, _, route, showdown){

// TODO:
// - Add breadcrumb.

$(function(){

var template = function(templ, args){
  var fn = jade.compile(templ, {locals:args});
  return fn(args);
}

route.root = '/'

route(function(req){
  req.use('template', template);

  req.get(function(){
      
    if(req.isLast()){
      req.redirect('/news');
    }
    
    req
      .enter('fadeIn')
      .render('/jade/main.jade', '/css/main.css')
      .exit('fadeOut')
  
    req.get('news', '#content', function(){
      var data, urls;
      
      if(req.isLast()){
        req.before(function(done){
          curl(['text!/data/news.json'], function(d){
            data = JSON.parse(d);
            req.data = _.pluck(data, 'url');
            done();
          });
        });
        
        req.exit('fadeOut');
        
        req.load(function (done){
          req.data = _.isArray(req.data)?req.data:[req.data];
          for(var i=0, len=req.data.length;i<len;i++){
            data[i].content = showdown.parse(req.data[i]);
            data[i].date = moment(data[i].date).fromNow();
            data[i].url = req.resourceRoute(data[i].url);
          }
          req.data = data;
          done();
        });
        
        req.render('/jade/news.jade', '/css/news.css', 'news');
        req.enter('fadeIn');
      }else{        
        req.get(':id', '#content', function() {
          req.before(function(done){
            curl(['text!/data/news.json'], function(d){
              data = JSON.parse(d);
              req.data = _.pluck(data, 'url');
              done();
            });
          });
          
          var docUrl = '/data/news/'+req.params.id+'.json';
          
          req.exit('fadeOut');
          req.load(docUrl, function(done){
            for(var i=0, len=data.length;i<len;i++){
              if(data[i].url===docUrl){
                data[i].content = showdown.parse(req.data)
                data[i].date = moment(data[i].date).fromNow();
                data[i].url = req.url;
                req.data = data[i];
                break;
              }
            }
            done();
          });
          req.render('/jade/news-detail.jade', '/css/news.css', 'doc');
          req.enter('fadeIn');
        });
      }
    });
    
    // About
    req.get('about', '#content', function(){
      req.enter('fadeIn').render('/jade/about.jade').exit('fadeOut');
    });
      
    // Products
    req.get('products', '#products', function(){
    
      // render submenu.
      req.enter('show', 'fast');
      req.render('/jade/products.jade', '/css/products.css',function(){
        $('#products-menu').addClass('open');
      });
      req.exit('hide',function(){
        $('#products-menu').removeClass('open');
      });
          
      req.get('castmill','#content', function(){
        req.exit('fadeOut').render('/jade/products/castmill.jade').enter('fadeIn');
      });
         
      req.get('ginger', '#content', function(){
        req.exit('fadeOut').render('/jade/products/ginger.jade').enter('fadeIn');
      });
    });
    
    // Partners
    req.get('partners', '#content', function(){
      req.exit('fadeOut').render('/jade/partners.jade').enter('fadeIn');
    });
      
    // Career
    req.get('career', '#content', function(){
    
      if(req.isLast()){
        req.exit('fadeOut').render('/jade/career.jade').enter('fadeIn');
      }else{
        req.get(':id', '#content', function() {
          req.render('/jade/career/'+req.params.id+'.jade');
          req.enter('fadeIn');
          req.exit('fadeOut');
        });
      }
    });
      
    // Contact
    req.get('contact', '#content', function(){
      req.exit('fadeOut').render('/jade/contact.jade','/css/contact.css').enter('fadeIn');
    });
    
    // Copyright
    req.get('copyright', '#content', function(){
      req.exit('fadeOut').render('/jade/copyright.jade').enter('fadeIn');
    });
  })
    
});
});
  
});
