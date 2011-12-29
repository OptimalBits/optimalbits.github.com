define(['js!jade.js'],function(){

var jade = require('jade');

var ginger = {};

function isString(s){
  return typeof s === 'string';
}
function isObject(o){
  return typeof o === 'object';
}
function isFunction(o){
  return typeof o === 'function';
}
function isArray(a){
  return Array.isArray(a);
}

var route = ginger.route= {};

var parseQuery = function(keyValues){
  return {}
}

var Context = function(url){
  var s = url.split('?');
  
  this.components = s[0].split('/')
  if(this.components[0] === '#'){
    this.index = 1;
  }else{
    this.index = 0;
  }
  
  this.query = parseQuery(s[1]);
}

// TODO: Add :id support.
Context.prototype.get = function(component, $el, cb){
  if(isString(component)){
    if(component.charAt(0) === ':'){
      
    } else if(component === this.components[this.index]){
      this.index++;
    }else{
      return;
    }
    
    this.$el = $el;
  }else{
    this.$el = component;
    cb = $el;
  }
  cb && cb.call(this);
  return this;
}
// ( templateUrl, [locals, cb])
Context.prototype.render = function(templateUrl, css, locals, cb){
  var self = this;
    
  if(isObject(css)){
    cb = locals;
    locals = css;
    css = undefined;
  }else if(isFunction(css)){
    cb = css;
    css = undefined;
  }
  if(isFunction(locals)){
    cb = locals;
    locals = {}
  }
  
  var items = ['text!'+templateUrl];
  if(css){
    items.push('css!'+css)
  }
  
  curl(items, function(t){
    var fn = jade.compile(t,{locals:locals});
    self.$el.html(fn(locals));
    cb && cb.call(self);
  });
  return this;
}
Context.prototype.enter = function(cb){
  cb.call(this);
  return this;
}

Context.prototype.load = function(urls, cb){
  var base = '';
  
  for(var i=0, len=this.index;i<len;i++){
    base += this.components[i]+'/';
  }
  
  if(!isArray(urls)){
    urls = [urls];
  }
  
  var _urls = [];
  for(var i=0, len=urls.length;i<len;i++){
    _urls.push('text!'+urls[i])
  }
  
  curl(_urls, function(){
    var objs = [];
    for(var i=0, len=arguments.length;i<len;i++){
      var obj = JSON.parse(arguments[i]),
          url = urls[i].split('/');
      
      obj.url = base+url[url.length-1].split('.')[0]
    
      objs.push(obj)
    }
    cb(objs);
  });
}

Context.prototype.isLast = function(){
  return this.index >= this.components.length-1
}

route.listen = function (cb) {
  var fn = function(){ 
    cb && cb(new Context(location.hash));
  }

  if (location.hash === '') {
    if (route.root) {
      location.hash = route.root;
    }
  }else{
    fn();
  }

  if ('onhashchange' in window) {
    window.onhashchange = fn;
  } else {
    setInterval(fn, 50);
  }
}

return ginger;
  
});

/**
  ginger.route.listen(function(context){

  context.get($('#main'), function(context){
    context
      .enter(function(){
        this.$el.hide('fast')
      })
      .render('main.jade', locals, function(){
        this.$el.show('fast');
      })
    
    context.get('news/:id?', $('#content'), function(context){
      context.id
    });
  
    context('products', $content, function(context){
    }
  }
  })

  context.load(jsons, cb)

  context = {
    components = [],
    query = {},
    
  }

*/
