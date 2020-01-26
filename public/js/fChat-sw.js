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
  console.log('fetch')
  e.respondWith(

    fetch(e.request) // do a regular fetch, no action
      // maybe refresh cache?
      .catch(() => { // there was network error, we use cache instead
        console.log('loading from cache')
        //return caches.match(e.request)
        return caches.match(config.offline)
      })
  )
})