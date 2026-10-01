const CACHE_PREFIX='style-dna-';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith(CACHE_PREFIX))await caches.delete(k);await self.clients.claim();})()));
self.addEventListener('fetch',()=>{});
