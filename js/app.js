define(['gnd',
        'showdown',
        'js!jade.js',
        'js!moment.min.js'], function(Gnd, showdown){

$(function(){

  Gnd.use('template', function(templ){
    return jade.compile(templ); //, {locals:args});
  });

// Effects
var fadeOut = function(el, done){
  $(el).fadeOut(done)
}
var fadeIn = function(el, done){
  $(el).fadeIn(done)
}

Gnd.Route.listen(function(req){
  req.get(function(){
      
    if(req.isLast()){
      req.redirect('/news');
    }
    
    req
      //.enter(fadeIn)
      .render('/jade/main.jade', '/css/main.css')
      .exit(fadeOut)
  
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
        
        req.exit(fadeOut);
        
        req.load(function (done){
          req.data = _.isArray(req.data)?req.data:[req.data];
          for(var i=0, len=req.data.length;i<len;i++){
            data[i].content = showdown.parse(req.data[i]);
            data[i].date = moment(data[i].date).fromNow();
            data[i].url = (function(resource){
                              var base = req.currentSubPath();
                              components = resource.split('/');
                              return '/#'+ base+'/'+components[components.length-1].split('.')[0];
                            }
                          )(data[i].url);
          }
          req.data = {news:data};
          done();
        });
        
        req.render('/jade/news.jade', '/css/news.css');
        req.enter(fadeIn);
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
          
          req.exit(fadeOut);
          req.load(docUrl, function(done){
            for(var i=0, len=data.length;i<len;i++){
              if(data[i].url===docUrl){
                data[i].content = showdown.parse(req.data)
                data[i].date = moment(data[i].date).fromNow();
                data[i].url = req.url;
                break;
              }
            }
            req.data = {doc:data[i]};
            done();
          });
          req.render('/jade/news-detail.jade', '/css/news.css',Gnd.Util.noop);
          req.enter(fadeIn);
        });
      }
    });
    
    // About
    req.get('about', '#content', function(){
      req.enter(fadeIn).render('/jade/about.jade').exit(fadeOut);
    });
      
    // Products
    req.get('products', '#content', function(pool){
      
      var productsMenu = new Gnd.View('#products', {
        templateUrl: '/jade/products-menu.jade',
        cssUrl: '/css/products.css'
      });
      
      pool.autorelease(productsMenu);
      
      // render submenu.
      req.enter(function(el, done){
        $('#products-menu')[0].className = 'open';
        fadeIn(el, done);
      });
      
      if(req.isLast()){
        req.render('/jade/products.jade');
      }
      
      req.after(function(done){
        productsMenu.init(function(){
          productsMenu.render();
          $('#products-menu').fadeIn('fast', done);
        });
      });
      
      req.exit(function(el, done){
        $('#products-menu')[0].className = '';
        fadeOut(el, done);
      });
      
      req.get('castmill','#content', function(){
        req.exit(fadeOut).render('/jade/products/castmill.jade').enter(fadeIn);
      });
         
      req.get('ground', '#content', function(){
        req.exit(fadeOut).render('/jade/products/ginger.jade').enter(fadeIn);
      });
      
      req.get('nodejs', '#content', function(){
        req.exit(fadeOut).render('/jade/products/nodejs.jade').enter(fadeIn);
      });
    });
    
    // Partners
    req.get('partners', '#content', function(){
      req.exit(fadeOut).render('/jade/partners.jade').enter(fadeIn);
    });
      
    // Career
    req.get('career', '#content', function(){
    
      if(req.isLast()){
        req.exit(fadeOut).render('/jade/career.jade').enter(fadeIn);
      }else{
        req.get(':id', '#content', function() {
          req.render('/jade/career/'+req.params.id+'.jade');
          req.enter(fadeIn);
          req.exit(fadeOut);
        });
      }
    });
      
    // Contact
    req.get('contact', '#content', function(){
      req.exit(fadeOut).render('/jade/contact.jade','/css/contact.css',Gnd.Util.noop).enter(fadeIn);
    });
    
    // Copyright
    req.get('copyright', '#content', function(){
      req.exit(fadeOut).render('/jade/copyright.jade').enter(fadeIn);
    });
    
    // Vision
    req.get('vision', '#content', function(){
      req.exit(fadeOut).render('/jade/vision.jade').enter(fadeIn);
    });
    
  })
    
});
});
  
});
