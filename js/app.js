define(['gnd',
        'showdown',
        'js!jade.js',
        'js!moment.min.js'], function(Gnd, showdown){

// TODO:
// - Add breadcrumb.

$(function(){

var template = function(templ, args){
  var fn = jade.compile(templ, {locals:args});
  return fn(args);
}
// Effects
var fadeOut = function(el, done){
  $(el).fadeOut(done)
}
var fadeIn = function(el, done){
  $(el).fadeIn(done)
}

Gnd.Route.listen(function(req){
  req.use('template', template);

  req.get(function(){
      
    if(req.isLast()){
      req.redirect('/news');
    }
    
    req
      //.enter(fadeIn)
      .render('/jade/main.jade', '/css/main.css',Gnd.Util.noop)
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
        
        req.render('/jade/news.jade', '/css/news.css', Gnd.Util.noop);
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
    req.get('products', '#products', function(){
    
      // render submenu.
      req.enter(function(el,done){
        $('#products-menu')[0].className = 'open';
        $(el).fadeIn('fast');
      });
      req.render('/jade/products.jade', '/css/products.css',Gnd.Util.noop);
      req.exit(function(el,done){
        $('#products-menu')[0].className = '';
        $(el).fadeOut('fast');
        done();
      });
          
      req.get('castmill','#content', function(){
        req.exit(fadeOut).render('/jade/products/castmill.jade').enter(fadeIn);
      });
         
      req.get('ginger', '#content', function(){
        req.exit(fadeOut).render('/jade/products/ginger.jade').enter(fadeIn);
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
  })
    
});
});
  
});
