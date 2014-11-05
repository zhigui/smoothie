listIndex=1;
var app = S.start();
var home = app.getPage("home");
home_vm = new Vue({ el: home, data:{} })
home.addEventListener("ready", function(){
  home_vm.$data.loading=true;
  fetchList( getAnydate(listIndex) );
});

 function getAnydate(AddDayCount) {
  var d, dd, m, y;
  dd = new Date();
  dd.setDate(dd.getDate() + AddDayCount);
  y = dd.getFullYear();
  m = ('0' + (dd.getMonth()+1)).slice(-2)
  d = ('0' + dd.getDate()).slice(-2)
  return y  + m  + d;
};


function ajax(url, success, error){
  var xhr = new XMLHttpRequest();
 

  xhr.onload = function(e) {
    var result=this.response;
    if (this.status == 200) {
      result=JSON.parse(result);
      if(typeof success == 'function'){
        success(result);
      }   
    }else{
      error(result);
    }
  };

  xhr.onerror = function(){
      var result=this.response;
      if(typeof error == 'function'){
          error(result);
      }
    }
  xhr.open('GET', url, true);
  
  xhr.send() 
}

function fetchList(date){

  home_vm.$data.loading=true;
  ajax("../fetch?url=http://news-at.zhihu.com/api/3/stories/before/"+date,
    function(result){
      listIndex--;
      home_vm.$data.loading=false;
      if(!home_vm.$data.list.stories){
        home_vm.$data.list=result;
      }else{
        home_vm.$data.list.stories= home_vm.$data.list.stories.concat(result.stories);
      }
  });  
}

var detail = app.getPage("detail");
detail_vm = new Vue({ el: detail, data:{} })

var router = S.Router({
  routes:{
    '': "default",
    'news/:id':"detail",
    'form':"test"
  },
  test:function(){
    // app.show("form", 'slide-up');
    // console.log(this);
    app.show("form", 'scale');
    console.log(this);
  },
  default:function(){
    app.show("home");    
  },
  "detail":function(newsid){
    app.show('detail');
    if(detail_vm.$data.nid!=newsid){
      detail_vm.$data.nid=newsid;
      detail_vm.$data.content={};
      detail_vm.$data.loading=true;
      setTimeout(function(){

        ajax("../fetch?url=http://news-at.zhihu.com/api/3/story/"+newsid,
          function(result){
            detail_vm.$data.loading=false;
            detail_vm.$data.content=result;
          });
      },600)
    }
    
  }
})

var list = document.querySelector(".sm-content");
list.addEventListener("scroll", function(){
  if(listIndex<-20 ) return;
  var that=this;
  clearTimeout(window.scrollTimer);
  window.scrollTimer=setTimeout(function(){
    if(that.scrollTop > (that.scrollHeight - that.clientHeight-10) ){
      fetchList( getAnydate(listIndex) );
    }
  }, 500);
  
})