'use strict'

const socket = io.connect(window.location.href) // make connection

const message = document.getElementById('message'),
  handle = document.getElementById('handle'),
  btn = document.getElementById('send'),
  output = document.getElementById('output'),
  feedback = document.getElementById('feedback'),
  title = document.getElementById("title")

const chat = () => {  // send message callback
  socket.emit('chat', {
    message: message.value,
    handle: handle.value,
    time: new Date()
  });
  message.value = "" // empty input field
}

// try checking for connection...! (socket.onerror)

btn.addEventListener('click', e => {  // click submit
  if (message.value != '') chat()
});

window.addEventListener('keyup', e => { // hit enter
  if (e.keyCode === 13 && message.value != '') chat()
})

message.addEventListener('keypress', () => {
  socket.emit('typing', handle.value);
})

socket.on('chat', data => {
  feedback.innerHTML = '';
  // add timestamp
  output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
});

// remove '...typing' if input is unfocused
// 'x' to clear input field
socket.on('typing', data => {
  feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
  // remove it if no message received in a minute
});

// store message history for a day

// don't allow message sending while offline

if (navigator.serviceWorker) { // service worker
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/js/fChat-sw.js', {
      scope: '/'  // default scope is the loaction of sw
    })
    // .then((registration) => console.log('fChat-sw.js registered with scope: ' + registration.scope))
  })
}

const installHandler = () => {  // insall event callback
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

let deferredPromptEvent // install promt
window.addEventListener('beforeinstallprompt', (e) => {
  // console.log('beforeinstall')
  deferredPromptEvent = e // stash event to trigger later

  let install = document.createElement("button")
  install.innerHTML = "Install"
  install.setAttribute("id", "install")
  title.parentNode.insertBefore(install, title.nextSibling)

  installHandler()
})
