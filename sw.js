// Service worker de Je Falla : garde l'appli en cache pour la connexion lente
var CACHE = 'jefalla-v3';
var FICHIERS = ['./', './index.html', './manifest.json', './jf192.png', './jf512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FICHIERS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (noms) {
    return Promise.all(noms.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));
  }));
  self.clients.claim();
});

// Réseau d'abord (pour avoir les mises à jour), cache si hors ligne
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (rep) {
      var copie = rep.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copie); });
      return rep;
    }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match('./index.html'); }); })
  );
});
