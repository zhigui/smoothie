//Router module is reference from the Backbone.js

;(function(win){
  var sm = win.Smoothie = win.Smoothie || {};

  function Router(options){
    this._routes=[];
    this._hashpool=[];
    
    this.add(options);
    var rootStripper = /^\/+|\/+$/g;
    
    var trailingSlash = /\/$/;

    var that =this;
    win.addEventListener("hashchange",  function(){
      that.checkUrl();
    });
    this.checkUrl();
  }

  Router.prototype={
    checkUrl: function(){
      var hash = this.getFragment();
      var sender = this._hashpool[hash];
      // if(hash=== this.fragment) return;
      // this.fragment= hash;
      for(var i=0; i<this._routes.length; i++){
        var rule = this._routes[i];
        if(rule.route.test(hash)){
          var args=this._extractParameters(rule.route, hash);
          var callback=rule.callback;
          if (callback) callback.apply(sender, args);
        }
        

      }
    },
    getFragment:function(url){
      var routeStripper = /^[#\/]|\s+$/g;
      url = url || win.location.href;
      var match = url.match(/#(.*)$/);
      var fragment = match ? match[1] : '';
      return fragment.replace(routeStripper, '');
    },
    _updateHash: function(fragment, replace) {
      if (replace) {
        var href = win.location.href.replace(/(javascript:|#).*$/, '');
        win.location.replace(href + '#' + fragment);
      } else {
        win.location.hash = '#' + fragment;
      }
    },
    navigate:function(){
      this._updateHash();
    },
    add:function(options){
      var routes=options.routes;
        for(var name  in routes ){
          var routeReg = this._routeToRegExp(name);
          var fn=routes[name];
          if (typeof fn === 'string') 
            fn = options[routes[name]];

          if(fn){
            this._routes.push( { route:routeReg, callback: fn ? fn : null } )
          }
        }
    },
    remove:function(routerName){

      return delete this._routes[routerName];
    },
    _routeToRegExp:function(route) {
      var optionalParam = /\((.*?)\)/g;
      var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;
      var namedParam    = /(\(\?)?:\w+/g;
      var splatParam    = /\*\w+/g;

      route = route.replace(escapeRegExp, '\\$&')
                 .replace(optionalParam, '(?:$1)?')
                 .replace(namedParam, function(match, optional) {
                   return optional ? match : '([^/?]+)';
                 })
                 .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      params = params.map(function(param, i) {
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });

      return params;
    }
  }

  sm.Router=function(options){
    return new Router(options);
  };


})(window);