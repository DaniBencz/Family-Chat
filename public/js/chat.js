'use strict'

// Make connection
const socket = io.connect(window.location.href)

// Query DOM
const message = document.getElementById('message'),
  handle = document.getElementById('handle'),
  btn = document.getElementById('send'),
  output = document.getElementById('output'),
  feedback = document.getElementById('feedback'),
  title = document.getElementById("title")

// Emit events
btn.addEventListener('click', function (e) {
  socket.emit('chat', {
    message: message.value,
    handle: handle.value,
    time: new Date()
  });
  message.value = ""; // empty input field
});

message.addEventListener('keypress', function () {
  socket.emit('typing', handle.value);
})

// Listen for events
socket.on('chat', function (data) {
  feedback.innerHTML = '';
  // add timestamp
  output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
});

socket.on('typing', function (data) {
  feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
  // remove it if no message received in a minute
});

// store message history for a day

// while offline store outgoing messages in outbox

// send messages from outbox once back online

// empty outbox once back online

// service worker
if (navigator.serviceWorker) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/js/fChat-sw.js', {
      scope: '/'  // default scope is the loaction of sw
    })
      .then((registration) =>
        console.log('fChat-sw.js registered with scope: ' + registration.scope))
  })
}

const installHandler = () => {
  install.addEventListener('click', e => {
    install.style.display = 'none'
    deferredPromptEvent.prompt()
    deferredPromptEvent.userChoice
      .then(result => {
        if (result.outcome === 'accepted') alert('well done')
        else alert('maybe next time')
      })
  })
}

// install promt
let deferredPromptEvent
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstall')
  deferredPromptEvent = e // stash event to trigger later

  let install = document.createElement("button")
  install.innerHTML = "Install"
  install.setAttribute("id", "install")
  title.parentNode.insertBefore(install, title.nextSibling)

  installHandler()
})
