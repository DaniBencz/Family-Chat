'use strict'

// console.log("in fChat-sw.js")

const config = {
  version: 'fChat-1',
  shell: [
    '/',  // this is needed, else won't work! 
    // 'index.html',
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

/* let online = false
let isFirstFetch = true
const firstFetch = () => {
  console.log('isFirstFetch: ', isFirstFetch)
  if (isFirstFetch) {
    fetch('http://localhost:8000').then(() => {
      online = true
      console.log('online: ', online)
    })
    isFirstFetch = false
  }
  return online
} */

const customResp = e => {
  //e.respondWith( new Response('Hello'))

  if (e.request.url.includes('socket.io')) { // socket connection gets to fetch
    // console.log('fetching ', e.request.url)
    e.respondWith(fetch(e.request)
      .catch(() => {  // if fails, show offline content
        // doesn't work
        return caches.match(config.offline)
      }))
  }
  else {  // all other content uses offline-first
    e.respondWith(caches.match(e.request) // metching done by url, method and vary-headers
      .catch(() => {
        fetch(e.request)
      }))
  }
}

self.addEventListener('fetch', e => { customResp(e) })