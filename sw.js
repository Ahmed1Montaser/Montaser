/* ملعب اللغات: offline cache. Bump VERSION when you upload a new index.html. */
var VERSION="mal3ab-v2";
var SHELL=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable-512.png","apple-touch-icon.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(VERSION).then(function(c){return c.addAll(SHELL);}).then(function(){return self.skipWaiting();}));});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==VERSION;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener("fetch",function(e){
  var req=e.request;if(req.method!=="GET")return;
  var url=new URL(req.url);
  if(url.origin===location.origin){
    /* app files: serve from cache right away, refresh the cache in the background */
    e.respondWith(caches.open(VERSION).then(function(c){
      return c.match(req,{ignoreSearch:true}).then(function(hit){
        var net=fetch(req).then(function(r){if(r&&r.ok)c.put(req,r.clone());return r;}).catch(function(){return hit||c.match("index.html");});
        return hit||net;
      });
    }));
  }else if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    /* fonts: cache after first load so they work offline */
    e.respondWith(caches.open(VERSION+"-fonts").then(function(c){
      return c.match(req).then(function(hit){return hit||fetch(req).then(function(r){c.put(req,r.clone());return r;});});
    }));
  }
});
