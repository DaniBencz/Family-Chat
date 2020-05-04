'use strict'

// https://jakearchibald.com/2014/offline-cookbook/#cache-only

const config = {
  version: 'fChat-3',
  shell: [
    '/',
    '../favicon.ico',
    'chat.js',
    '../styles.css',
    '../manifest.json',
    /* '../manifest.webmanifest', */
    '../offline/'
  ],
  offline: '/offline/'
}

// 1: INSTALL
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

// 3: ACTIVATE
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

  if (e.request.url.includes('socket.io')) { // socket connection gets to fetch
    e.respondWith(fetch(e.request))
  }
  else if (e.request.url.includes('.png')) {
    e.respondWith(
      caches.match(e.request) // 1, try cache first
        .then(resp => {
          return resp || fetch(e.request) // 2, cache won't yield first time around, go fetch
            .then(f_resp => {
              const respClone = f_resp.clone()  // resp can be used only once, workaround to clone it
              caches.open('png')
                .then(cache => {
                  cache.put(e.request, respClone) // update cache
                })
              return f_resp // return to client
            })
        })
    )
  }
  else {  // all other content uses offline-first
    e.respondWith(
      caches.match(e.request) // metching done by url, method, and vary-headers
        .then(resp => {
          return resp || fetch(e.request)
        })
    )
  }
}

// 2: FETCH
self.addEventListener('fetch', e => { customResp(e) })