;(function(win){
  
  var sm = win.Smoothie = win.Smoothie || {};

  function forms(obj){
    var formData = new FormData();
    for( var k in obj){
      formData.append(k, obj[k]);
    }
    return formData;
  }
  function params(obj){
      var params=[];
      var escape = encodeURIComponent;
      for( var k in obj){
        var v= obj[k];
        params.push( escape(k) + '=' + escape(v) );
      }
      return params.join('&').replace(/%20/g, '+')
  }


  sm.ajax=function(opts){

    var options = {
      url:"",
      method:"GET",
      data:{},
      dataType:"json",
      success:function(){},
      error:function(){}
    }

    for ( var i in opts ) {
      options[i] = opts[i];
    }

    var xhr = new XMLHttpRequest();
    xhr.onload = function(e) {
      var result=this.response;
      var error = false, dataType = options.dataType;
      if (this.status == 200) {
        try {
          if (dataType == 'script')    (1,eval)(result)
          else if (dataType == 'xml')  result = this.responseXML
          else if (dataType == 'json') result = /^\s*$/.test(result) ? null : JSON.parse(result);
        } catch (e) { error = e }

        if (error) options.error(error, 'parsererror', xhr);
        else options.success(result);

      }else{
        options.error(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr);
      }
    };

    xhr.onerror = function(){
      options.error(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr);
    }


    if(options.method.toLowerCase() == 'post'){
      xhr.open('POST', options.url, true);
      // xhr.send(forms(options.data));
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      xhr.send(params(options.data));
    }else{
      var url = options.url;
      if(options.data)
        url=url+"?"+params(options.data).replace('??','?');
      xhr.open('GET', url, true);
      xhr.send() 
    }


  }


})(window);