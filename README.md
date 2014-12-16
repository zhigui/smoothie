#Smoothie


##Smoothie.js

Add the smoothie.js to your document.
```
<script src="../js/smoothie.js"></script>
```

Start the smoothie.js with:
```
var app = S.start();
```

The smoothie.js will cut the the dom that with the attribute `data-page="home"` to the memory to manage:
```
<div class="sm-page" data-page="home" ></div>
```

You can access your page dom with the `data-page` value:
```
var home = app.getPage("home");
```

show page on the main screen:
```
app.show("home");
```
show a modal page on the screen:
```
app.show("home", true)
```
![page![Alt text](http://ww4.sinaimg.cn/large/6e8f3d1dgw1enbpfh53opg208u0danhu.gif)
](http://ww4.sinaimg.cn/large/6e8f3d1dgw1enbpfh53opg208u0danhu.gif)
##Page Events


`first` Fired when page load at the first time:
`load` Fired when page showed(animation effect ended)
`unload` Fired when page hide(animation effect ended)
`show` Fired when page show
`hide` Fired when page hide

```
var home = app.getPage("home");
home.addEventListener("first", function(){
    console.log(this); //page dom object
})
```



##Custom Animation
Custom the page switch animation by youself.

implementation the page switch animation css:
 

Forward style,:
```
.sm-enter-{effect name} {//required
    -webkit-animation: fadein .5s; 
}
.sm-leave-{effect name} {
    /*-webkit-animation: fadeout .5s;*/
}
```
Back style:
```
.sm-enter-{effect name}-back {
    /*-webkit-animation: myAnimation1 .5s;*/
}
.sm-leave-{effect name}-back {//required
    -webkit-animation: fadeout .5s;
}
```

using your effect 
```
app.show("home", "your effect name" );
```

##Router

```
<script src="../js/router.js"></script>
```

```
var router = S.Router({
  routes:{
    '': "default",
    'news/:id':"detail"
  },
  "detail":function(newsid){
    console.log(newsid)
  }
})
```

