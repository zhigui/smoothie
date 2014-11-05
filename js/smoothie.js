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
      }
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

    var TransitonStyle={
      "slide-left": 'back',
      "slide-up": 'slide-down'
    }
    var showPage = function(pageName, type, callback){
      if(!type) 
        type = 'slide-left';
      if(typeof type === "function")
        callback = type;
      var that = this;
      var pageToShow = getPage(pageName);
      var currentPageName =  pageHistory[pageHistory.length-1];
      var currentPage = getPage(currentPageName);

      pageTransition(pageToShow, currentPage, type);

      if(pageHistory.length<1){
        document.body.appendChild
      }

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
    var show = function(pageName, type, callback){

      // if(!transitionFinished) return; 
      if(!type) type = "slide-left";
      if(typeof type === "function")
        callback = type;

      var that = this;
      var page=pages[pageName];

      

      if(pageHistory.length<1){
        document.body.appendChild(page);
        // if(type in TransitonStyle ){
          // page.pageout = TransitonStyle[type];
        // }
        pushPage(pageName);

 

        if(!page.firstLoad) {
          page.firstLoad = true;
          utils.fireEvent("ready", page);    
        }
        if(typeof callback === "function")
          callback(page); 

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
      // if(type === 'slide-down' || type === 'back'){
        popPage();
      }else{
        pushPage(pageName);
      }


      if(currentPage){
        if(!isBack){
          page.addEventListener('webkitTransitionEnd', finishTransition, false);
          page.addEventListener('transitionend', finishTransition, false);
          page.addEventListener('webkitAnimationEnd', finishTransition, false);
          page.addEventListener('animationend', finishTransition, false);
        }else{
          currentPage.addEventListener('webkitTransitionEnd', finishTransition, false);
          currentPage.addEventListener('transitionend', finishTransition, false);
          currentPage.addEventListener('webkitAnimationEnd', finishTransition, false);
          currentPage.addEventListener('animationend', finishTransition, false);
        }
        
      }
      

      function finishTransition () {
        this.removeEventListener('webkitTransitionEnd', finishTransition);
        this.removeEventListener('transitionend', finishTransition);
        this.removeEventListener('webkitAnimationEnd', finishTransition);
        this.removeEventListener('animationend', finishTransition);
        // currentPage.remove();
        // 
        currentPage.className = currentPage.className.replace(/sm-(leave|enter)-[^\s \"]*/ig, '');
        page.className = page.className.replace(/sm-(leave|enter)-[^\s \"]*/ig, '');

        if (currentPage.parentNode != null)
          currentPage.parentNode.removeChild(currentPage);

        utils.fireEvent("hide", currentPage);
        // that.transitionFinished = true;
        //unblock ui
        document.body.style.pointerEvents = '';

      }

      if(!page.firstLoad) {
        page.firstLoad = true;
        utils.fireEvent("ready", page); 
      }
      if(typeof callback === "function")
        callback(page);

      utils.fireEvent("show", page);
    }

    var pageTransition = function(pageToShow, oldpage, type, isBack){
      if(type in TransitonStyle ){
        pageToShow.pageout = TransitonStyle[type];
      }else{
        if(!isBack)pageToShow.pageout = type+"-back";
      }
      var duration = "300ms";
      switch(type){


        case 'back'://slide-right
        

          utils.css(pageToShow,{
            'Transition' : cssPrefix + 'transform ' + duration,
            'Transform' : 'translate3d(-30%,0,0)'
          } );

          document.body.insertBefore( pageToShow, oldpage );
          // currentPage.style.webkitTransition="-webkit-transform 0ms";
          // currentPage.style.webkitTransform='translate3d(0,0,0)';


          setTimeout(function(){
            utils.css(oldpage,{
              'Transition':cssPrefix+'transform ' + duration,
              'Transform' : 'translate3d(100%,0,0)'
            } )

            utils.css(pageToShow,{
              'Transition':cssPrefix+'transform ' + duration,
              'Transform' : 'translate3d(0,0,0)'
            } )
             
          },50)

          break;
        case 'slide-up':
          utils.css(oldpage,{
              'Transition':cssPrefix+"transform 0ms",
              'Transform' : 'translate3d(0,0,0)'
            } )

          utils.css(pageToShow,{
            'Transition':cssPrefix+'transform ' + duration,
            'Transform' : 'translate3d(0, 100%, 0)'
          } )
           
          document.body.appendChild(pageToShow);

          setTimeout(function(){
            utils.css(oldpage,{
              'Transition':cssPrefix+'transform  ' + duration,
              'Transform' : 'translate3d(0,-10%,0)'
            } )

            utils.css(pageToShow,{
              'Transition':cssPrefix+'transform ' + duration,
              'Transform' : 'translate3d(0, 0, 0)'
            } )

          },50)
          break;
        case 'slide-down':
          utils.css(pageToShow,{
            'Transition':cssPrefix+'transform ' + duration,
            'Transform' : 'translate3d(0,-10%,0)'
          } )
          utils.css(oldpage,{
            'Transition':cssPrefix+'transform  ' + duration,
            'Transform' : 'translate3d(0, 0, 0)'
          } )

          document.body.insertBefore( pageToShow, oldpage );
          // currentPage.style.webkitTransition="-webkit-transform 0ms";
          // currentPage.style.webkitTransform='translate3d(0,0,0)';


          setTimeout(function(){
            utils.css(oldpage,{
              'Transition':cssPrefix+'transform  ' + duration,
              'Transform' : 'translate3d(0, 100%, 0)'
            } )

            utils.css(pageToShow,{
              'Transition':cssPrefix+'transform ' + duration,
              'Transform' : 'translate3d(0,0,0)'
            } )
            
          },50)

          break;
        case 'slide-left':

          utils.css(oldpage,{
            'Transition':cssPrefix+'transform   0ms',
            'Transform' : 'translate3d(0,0,0)'
          } )

          utils.css(pageToShow,{
            'Transition':cssPrefix+'transform ' + duration,
            'Transform' : 'translate3d(100%,0,0)'
          } )

          document.body.appendChild(pageToShow);

          setTimeout(function(){
            utils.css(oldpage,{
              'Transition':cssPrefix+'transform   ' + duration,
              'Transform' : 'translate3d(-10%,0,0)'
            } )

            utils.css(pageToShow,{
              'Transition':cssPrefix+'transform ' + duration,
              'Transform' : 'translate3d(0,0,0)'
            } )

          },50);
          break;
        default:
          if(type.lastIndexOf("-back")>0){
               
              document.body.insertBefore( pageToShow, oldpage );
              // oldpage.classList.remove("sm-enter");
              oldpage.classList.add("sm-leave-"+type);

              // pageToShow.classList.remove("sm-leave");
              pageToShow.classList.add("sm-enter-"+type);
           }else{
              document.body.appendChild(pageToShow);
              // oldpage.classList.remove("sm-enter");
              oldpage.classList.add("sm-leave-"+type);

              // pageToShow.classList.remove("sm-leave");
              pageToShow.classList.add("sm-enter-"+type);
              break;
           }
         
      }
      

    }

    pushPage = function(pageName){
      return pageHistory.push(pageName);
    }
    popPage = function(){
      return pageHistory.pop();
    }

  return {
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
