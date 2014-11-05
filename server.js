var arguments = process.argv.splice(2);
var PORT = arguments[0] || 8000;
var http = require('http'), url= require("url"), path= require("path"), fs=require("fs"), os=require('os');

//More media types http://www.iana.org/assignments/media-types/
var mime = {
    // text
    "css": "text/css",
    "js": "text/javascript",
    "csv": "text/csv",
    "htm": "text/html",
    "html": "text/html",
    "txt": "text/plain",
    "text": "text/plain",
    "conf": "text/plain",
    "log": "text/plain",
    "vtt": "text/vtt",
    "wml": "text/vnd.wap.wml",
    "wmls": "text/vnd.wap.wmlscript",
    "appcache": "text/cache-manifest",


    // image
    "bmp": "image/bmp",
    "gif": "image/gif",
    "ico": "image/x-icon",
    "jpe": "image/jpeg",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "svg": "image/svg+xml",
    "webp": "image/webp",
    "tiff": "image/tiff",

    // application
    "json": "application/json",
    "xml": "application/xml",
    "atom": "application/atom+xml",
    "pdf": "application/pdf",
    "swf": "application/x-shockwave-flash",
    "doc": "application/msword",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "ppt": "application/vnd.ms-powerpoint",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "xls": "application/vnd.ms-excel",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    
    // audio
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "ogg": "audio/ogg",
    "m3u": "audio/x-mpegurl",
    "weba": "audio/webm",

    // video
    "mp4": "video/mp4",
    "3gp": "video/3gpp",
    "mpeg": "video/mpeg",
    "f4v":  "video/x-f4v",
    "wmv": "video/x-ms-wmv",
    "avi": "video/x-msvideo"
};
var server = http.createServer(function (request, response) {
    var host = 'http:\\/\\/'+request.headers.host+'\/fetch?url=';
    var pathname = url.parse(request.url).pathname;
    var query = url.parse(request.url).query;
    var realPath = "." + pathname;
     
    fs.exists(realPath, function (exists) {
        if (!exists) {
            if(pathname == '/fetch'){
                var arr=query.split('&');
                var params={};
                for(var i=0; i<arr.length; i++){
                   var  param_arr=arr[i].split('=');
                   params[param_arr[0]]=param_arr[1];
                }
                if(params.url){
                    var chunks = [],
                        size = 0;
                    http.get(params.url, function(res) {
                        res.on("data" , function(chunk){
                            chunks.push(chunk);
                            size += chunk.length;
                        });

                        res.on("end" , function(){
                            var data = Buffer.concat(chunks , size);
                            // data=data.replace(/src=\\"/, 'src=\"'+host);
                            if( res.headers['content-type'].indexOf("image")==-1 ){
                                data=data.toString().replace(/src=\\"/ig, 'src=\\"'+host);
                            }
                            response.writeHead(200, {'Content-Type': res.headers['content-type']});
                            // data=data.replace(/src=\\"/, 'src=\"'+host);
                            response.write(data);
                            response.end();
                        });
                     }).on('error', function(e) {
                      console.log("Got error: " + e.message);
                      response.end();
                    });
                }
                
            }else{
                response.writeHead(404, {
                    'Content-Type': 'text/html'
                });

                response.write('<!DOCTYPE> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL '+pathname+' was not found on this server.</p> </body></html>');
                response.end();
            }
            
        } else {
            // console.log(realPath);
            fs.readFile(realPath, "binary", function (err, file) {
                if (err) {
                    response.writeHead(500, {
                        'Content-Type': 'text/html'
                    });
                    
                    response.end('<!DOCTYPE> <html><head> <title>500 Internal Server Error</title> </head><body> <h1>Internal Server Error</h1></body></html>');
                } else {
                    var ext = path.extname(realPath);
                        ext = ext ? ext.slice(1) : 'unknown';
                    var contentType = mime[ext] || "text/plain";
                    response.writeHead(200, {'Content-Type': contentType});
                    response.write(file, "binary");
                    response.end();
                }
            });
        }
    });
})
server.listen(PORT);
console.log("Server runing at port: " + PORT + ".");
var ifaces=os.networkInterfaces();
for (var dev in ifaces) {
  var alias=0;
  ifaces[dev].forEach(function(details){
    if (details.family=='IPv4') {
      console.log(dev+(alias?':'+alias:''), 'http://'+ details.address+":"+PORT);
      ++alias;
    }
  });
}