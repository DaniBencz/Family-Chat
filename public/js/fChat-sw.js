console.log("in fChat-sw.js")

config = {
  version: 'fChat-2',
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

self.addEventListener('fetch', e => {
  console.log('request', e.request)
  e.respondWith(
    // new Response('Hello'),

    // this will not allow messages through
    /* caches.match(e.request)
      .catch(() => {
        fetch(e.request)
      }) */

    // this will download all the content 
    fetch(e.request)
      .catch((e) => {
        // return caches.match(e.request)
        // return e.default() // not supported
        return caches.match(config.offline) // metching done by url, method and vary-headers
      })

    //implement offline first for content, fetch for socket!
  )
})