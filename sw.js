/* Service Worker — BMC Global ITBMC */
const CACHE='itbmc-v86';
const SHELL=['./','./index.html','./css/styles.css','./js/app.js'];

self.addEventListener('install',function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(SHELL).catch(function(){});}));
});

self.addEventListener('activate',function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){if(k!==CACHE)return caches.delete(k);}));
    }).then(function(){return self.clients.claim();})
  );
});

self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  var url=new URL(req.url);
  // No interceptar Supabase ni APIs externes: sempre xarxa (dades sempre fresques)
  if(url.origin!==self.location.origin)return;

  if(req.mode==='navigate'){
    // Network-first per l'HTML (per rebre desplegaments nous)
    e.respondWith(
      fetch(req).then(function(res){var copy=res.clone();caches.open(CACHE).then(function(c){c.put('./index.html',copy);});return res;})
        .catch(function(){return caches.match('./index.html');})
    );
    return;
  }
  // Assets del mateix origen: stale-while-revalidate
  e.respondWith(
    caches.match(req).then(function(cached){
      var net=fetch(req).then(function(res){
        if(res&&res.status===200){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy);});}
        return res;
      }).catch(function(){return cached;});
      return cached||net;
    })
  );
});
