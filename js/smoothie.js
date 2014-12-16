var Smoothie = (function (argument) {

  var instantiated, pages = {}, pageHistory = [], cssPrefix, prefix="",
    testEl = document.createElement("div");
    cssPrefix = (function(){
        var vendors =['webkit', 'moz', 'ms', 'o'], i=0; l=vendors.length;
        for(; i<l; i++){
          var vendor=vendors[i];
          if(testEl.style[vendor+'TransitionProperty'] !== undefined){
            fix = '-' + vendor.toLowerCase() + '-';
            prefix = vendor;
            return fix;
          }
        }
        return "";
    })()
    
  var utils = {
    css:function(ele, prop, val){
      if(typeof prop == 'string'){
        var property = prop;
        if(prop.toLowerCase().indexOf("trans")==0) property = prefix +'T'+ prop.substr(1);
        ele.style[property] = val;
      }else{
        for( key in prop){
          var property = key;
          if(key.toLowerCase().indexOf("trans")==0) property = prefix +'T'+ key.substr(1);
          ele.style[property] = prop[key];
        }
      }
    },
    fireEvent: function (eventName, targetEle){
      var evt;
      if (typeof document.CustomEvent !== "undefined") {
        evt = new document.CustomEvent(eventName, {
            bubbles: true,
            cancelable: true
        });
      } else {
        evt = document.createEvent('Event');
        evt.initEvent(eventName, true, true);
      }
      targetEle.dispatchEvent(evt);
    },
    addClass : function (el, cls) {
      if (el.classList) {
        el.classList.add(cls);
      } else {
        var cur = ' ' + (el.getAttribute('class') || '') + ' ';
        if (cur.indexOf(' ' + cls + ' ') < 0) {
          el.setAttribute('class', (cur + cls).trim());
        }
      }
    },
    removeClass : function (el, cls) {
      if (el.classList) {
        el.classList.remove(cls)
      } else {
        var cur = ' ' + (el.getAttribute('class') || '') + ' ';
        var tar = ' ' + cls + ' ';
        while (cur.indexOf(tar) >= 0) {
          cur = cur.replace(tar, ' ');
        }
        el.setAttribute('class', cur.trim());
      }
    }
  }


  var addPage = function(page){
    pageName = page.getAttribute("data-page");
    if(page.parentNode){
      page.parentNode.removeChild(page);
    }
    pages[pageName] = page.cloneNode(true);
  }

  var getPage = function(pageName){
    return pages[pageName];
  }

  var removePage = function(pageName){
    var dom = getPage(pageName);
    if (dom.parentNode != null)
        dom.parentNode.removeChild(dom);
    dom = null;
    delete pages[pageName];
  }

  var closePage = function(){
    if(pageHistory.length>1){
      var page = pageHistory[pageHistory.length-2];
      show(page);
    }
  }

  var show = function(pageName, type, isModal){
    isModal = isModal || false;
    if(type === true){// show("name", true);
      isModal = true;
      type = "slide-up";//default modal value
    }

    type = type || "slide-left"
    
    var that = this;
    var page=pages[pageName];

    if(!page){
      console.error("the target page is empty"); 
      return;
    }
    

    // if the page history is empty 
    // no animation transition
    if(pageHistory.length<1){
      document.body.appendChild(page);
      pushPage(pageName);

      if(!page.firstLoad) {
        page.firstLoad = true;
        utils.fireEvent("ready", page);//deprecated
        utils.fireEvent("first", page);    
      }
       
      utils.fireEvent("load", page);
      utils.fireEvent("show", page);
      return;
    }



    var currentName = pageHistory[pageHistory.length-1];
    if( currentName === pageName ){
      return;
    }

    var currentPage = getPage(currentName);
    var prevName = pageHistory[pageHistory.length-2];
    

    //if the page want to switch in the history we think it's back
    //var isBack = pageHistory.indexOf(pageName) > -1  ? true : false;
    var isBack = ( prevName == pageName )? true : false;

    // transitionFinished = false;
    //block ui if last page is in transitioning
    document.body.style.pointerEvents = 'none';

     
    if(isBack){
      type = currentPage.pageout;
    }


    pageTransition(page, currentPage, type, isBack);

    if(isBack){
      utils.fireEvent("back", page);
      popPage();
    }else{
      pushPage(pageName);
    }


    if(currentPage){
      if(!isBack){
        page.addEventListener( prefix =='' ? 'transitionend' : prefix+'TransitionEnd', finishTransition, false);
        page.addEventListener( prefix =='' ?'animationend' : prefix+'AnimationEnd', finishTransition, false);
      }else{
        currentPage.addEventListener( prefix =='' ? 'transitionend' : prefix+'TransitionEnd', finishTransition, false);
        currentPage.addEventListener( prefix =='' ?'animationend' : prefix+'AnimationEnd', finishTransition, false);
      }
      
    }
    

    function finishTransition () {
      this.removeEventListener(prefix =='' ? 'transitionend' : prefix+'TransitionEnd', finishTransition); 
      this.removeEventListener(prefix =='' ?'animationend' : prefix+'AnimationEnd', finishTransition);
      
      // clear the transition class
      currentPage.className = currentPage.className.replace(/sm-(leave|enter)-[^\s \"]*/ig, '');
      page.className = page.className.replace(/sm-(leave|enter)-[^\s \"]*/ig, '');

      if ( currentPage.parentNode != null)
        if(!isModal || (isModal&&isBack))
          currentPage.parentNode.removeChild(currentPage);


      utils.fireEvent("hide", currentPage);
      utils.fireEvent("show", page);

      document.body.style.pointerEvents = '';

    }

    if(!page.firstLoad) {
      page.firstLoad = true;
      utils.fireEvent("ready", page);//deprecated
      utils.fireEvent("first", page);   
    }
     
    utils.fireEvent("load", page);
    utils.fireEvent("unload", currentPage);
  }

  var pageTransition = function(pageToShow, oldpage, type, isBack){

    if(!isBack)pageToShow.pageout = type+"-back";
     
    pageToShow.style.visibility = "hidden";
    if(type.lastIndexOf("-back")>0){
         
        document.body.insertBefore( pageToShow, oldpage );
        setTimeout(function(){
          pageToShow.style.visibility = "";
          // oldpage.classList.remove("sm-enter");
          utils.addClass(oldpage, "sm-leave-"+type );
          // oldpage.classList.add("sm-leave-"+type);
          // pageToShow.classList.remove("sm-leave");
          utils.addClass(pageToShow, "sm-enter-"+type );
          // pageToShow.classList.add("sm-enter-"+type);
           
        },0)
    }else{
        
        document.body.appendChild(pageToShow);
        // pageToShow.style.display = "";
        // oldpage.classList.remove("sm-enter");
        setTimeout(function(){
          pageToShow.style.visibility = "";
          // oldpage.classList.add("sm-leave-"+type);
          utils.addClass(oldpage, "sm-leave-"+type);

          // pageToShow.classList.remove("sm-leave");
          // pageToShow.classList.add("sm-enter-"+type);
          utils.addClass(pageToShow, "sm-enter-"+type);
        },0);
        
    } 
  }

  var pushPage = function(pageName){
    return pageHistory.push(pageName);
  }
  var popPage = function(){
    return pageHistory.pop();
  }


  var init=function(){
    var pageNodes = document.getElementsByClassName("sm-page");
    for(var i=pageNodes.length; i--;){
      addPage( pageNodes[i] );
    }

    var sm = {
      init:init,
      closePage:closePage,
      show:show,
      addPage:addPage,
      getPage:getPage
    };

    return sm;
  }

  return {
    version:"1.0.0",
    start: function() {
      if(!instantiated) {
        instantiated = init();
      }
      return instantiated;
    }

  };

  
  return sm;
})();
window.Smoothie = Smoothie;
window.S === undefined && (window.S = Smoothie)
