console.log("in fChat-sw.js")

config = {
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

const respondWith = e => {
  //e.respondWith( new Response('Hello'))

  if (e.request.url.includes('socket.io')) { // socket connection gets to fetch
    console.log('fetching ', e.request.url)
    e.respondWith(fetch(e.request))
      .catch(() => {  // if fails, show offline content
        return caches.match(config.offline)
      })
  }
  else {  // all other content uses offline-first
    console.log('cache ', e.request.url)
    e.respondWith(caches.match(e.request) // metching done by url, method and vary-headers
      .catch(() => {
        fetch(e.request)
      }))
  }
}

self.addEventListener('fetch', e => { respondWith(e) })