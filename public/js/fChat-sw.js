'use strict'

const config = {
  version: 'fChat-2',
  shell: [
    '/',
    '../favicon.ico',
    'chat.js',
    '../styles.css',
    '../manifest.json',
    '../offline/'
  ],
  offline: '/offline/'
}

self.addEventListener('install', e => {
  console.log('worker installed') // will be stale-logged
  e.waitUntil(
    caches.open(config.version).then(cache => {
      return cache.addAll(config.shell)
      // updated sw will not work until pages using old one are done loading,
      // but skipWaiting will force the activate event
    }).then(() => self.skipWaiting())
  )
})

// push notifications

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(cacheNames => {
        cacheNames.forEach(name => {
          if (name !== config.version) caches.delete(name)
        })
      })
  )
})

// add home screen: https://developers.google.com/web/fundamentals/app-install-banners

const customResp = e => {
  //e.respondWith( new Response('Hello'))

  if (e.request.url.includes('socket.io') /* || e.request.url.includes('/online') */) { // socket connection gets to fetch
    e.respondWith(fetch(e.request))
  }
  else {  // all other content uses offline-first
    e.respondWith(
      caches.match(e.request) // metching done by url, method and vary-headers
        .then(resp => {
          return resp || fetch(e.request)
        })
      /* .catch(() => { // this will not work: the match resolves even if the file is not found in the cache
        return fetch(e.request)
      }) */
    )
  }
}

self.addEventListener('fetch', e => { customResp(e) })