define(['showdown', 
        'js!jade.js'],function(showdown){

var counter = 0;

var jade = require('jade');

require.register('showdown.js', function(module, exports, require){
  module.exports = showdown;  
});

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

//
// Promise
// (Note: If used wrongly, the same callback can be called multiple times.
// This is because we fire the callbacks when queueing, if the queued promise
// so far already fired, it will fire every time a new promise is enqueued).
var Promise = function(){
  this.results = [];
  this.callbacks = [];
  this.counter = 0;
  this.accepted = null;
  this.id = counter;
  counter++;
};
Promise.prototype.queue = function(promise){
  var index = this.results.length,
      self = this;
  
  results.push(null);
  
  (function(index){
    promise.then(function(){
      self.counter++;
      self.results[index] = arguments;
      if(self.counter===self.promises.length){
        self.accepted = self.results;
        self._fireCallbacks();
      }
    })
  })(index);
}
Promise.prototype.then = function(cb){
  this.callbacks.push(cb);
  this._fireCallbacks();
}
Promise.prototype.accept = function(){
  this.accepted = arguments;
  this._fireCallbacks(); 
}
Promise.prototype._fireCallbacks = function(){
  var args = this.accepted;
  if(args!=null){
    var len = this.callbacks.length;
    if(len>0){
      for(var i=0;i<len;i++){
        this.callbacks[i](args);
      }
    }
  }
}
//
// Request (TODO: Rename to Request).
//
var Request = function(url, prevUrl){
  var s = url.split('?'), components, last;
  
  components = s[0].split('/')
  if(components[0] === '#'){
    this.index = 1;
  }else{
    this.index = 0;
  }
  
  if(components[last=components.length-1] === ''){
    components.splice(last, 1);
  }
  
  this.query = parseQuery(s[1]);
  this.params = {};
  this.components = components;
  this.promise = new Promise();
  this.promise.accept();
}

// TODO: Add queries.
Request.prototype.get = function(component, selector, cb){
  var self = this;

  if(isString(component)){
    if(component.charAt(0) === ':'){
      self.params[component.replace(':','')] = self.components[self.index];
    } else if(component !== self.components[self.index]){
       return;
    }
    self.index++;
  }else{
    selector = ('body');
    cb = component;
  }
  
  self.promise.then(function(){
    self.$el = $(selector);
    self.promise = new Promise();
    self.promise.accept();
    cb && cb.call(self, self);
  });
  
  return self;
}

Request.prototype.enter = function(cb){
  var self = this;
      promise = new Promise();

  (function(done){
    self.promise.then(function(){
      if(self.needRender()){
        cb.call(self, self, done);
      }else{
        promise.accept();
      }
    });
  })(promise.accept.bind(promise));
  
  self.promise = promise;
  return self;
}

// ( templateUrl, [locals, cb])
Request.prototype.render = function(templateUrl, css, locals, cb){
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
  }
  
  if(self.needRender()){
    var promise = new Promise(),  
      items = ['text!'+templateUrl];
      
    if(css){
      items.push('css!'+css)
    }
    (function(done){
      self.promise.then(function(){
        curl(items, function(t){
          var args = {}
          if(locals){
            args[locals] = self.data;
          }
          var fn = jade.compile(t,{locals:args});
          self.$el.html(fn(args));
          if(cb){
            cb.call(self, self, done);
          }else{
            done();
          }
        });
      });
    })(promise.accept.bind(promise));
    self.promise = promise;
  }else{
    cb && cb.call(self, self, function(){}); 
  }
  return self;
}

Request.prototype.load = function(urls, cb){
  var base = this._currentSubPath(),
      self = this,
      promise = new Promise();
  
  if(!isArray(urls)){
    urls = [urls];
  }
  
  var _urls = [];
  for(var i=0, len=urls.length;i<len;i++){
    _urls.push('text!'+urls[i])
  }
  
  (function(done){
    self.promise.then(function(){ 
      curl(_urls, function(){
        var args = arguments;
        var objs = [];
        for(var i=0, len=args.length;i<len;i++){
          var obj = JSON.parse(arguments[i]),
              url = urls[i].split('/');
      
          obj.url = base+'/'+url[url.length-1].split('.')[0]
    
          objs.push(obj)
        }
        objs = objs.length===1?objs[0]:objs;
        self.data = objs;
        if(cb){
          cb.call(self, self, done);
        }else{
          done();  
        }
      });
    });
  })(promise.accept.bind(promise));
    
  self.promise = promise;
  
  return self;
}

Request.prototype.isLast = function(){
  return this.index >= this.components.length
}

Request.prototype.needRender = function(){
  if(route.prevUrl){
    var subPath = this._currentSubPath()
    
    if(subPath === route.prevUrl.substring(0, subPath.length)){
      return false;
    }
  }
  return true;
}

Request.prototype._currentSubPath = function(){
  var subPath = '';
  for(var i=0, len=this.index;i<len;i++){
    subPath += this.components[i]+'/';
  }
  if(subPath.length>0){
    subPath = subPath.substr(0, subPath.length-1)
  }
  return subPath;
}

route.listen = function (cb) {
  var fn = function(){
    route.prevUrl = route._prevUrl;
    cb && cb(new Request(location.hash, route.prevUrl));
    route._prevUrl = location.hash;
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

route.redirect = function(url) {
  location.hash = url;
}

route.prevUrl = null;

return ginger;
  
});
