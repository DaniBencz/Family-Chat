'use strict'

const socket = io.connect(window.location.href) // make connection
// if(socket.disconnected) location.replace(window.location.href + 'offline/')

setInterval(() => { // redirect to offline page, if socket connection broken
  if (socket.disconnected) location.replace(window.location.href + 'offline/')
}, 3000)

const message = document.getElementById('message'),
  handle = document.getElementById('handle'),
  btn = document.getElementById('send'),
  output = document.getElementById('output'),
  feedback = document.getElementById('feedback'),
  send = document.getElementById('send')
  //title = document.getElementById("title"),
  //header = document.getElementById("header")

const chat = () => {  // send message callback
  socket.emit('chat', {
    message: message.value,
    handle: handle.value,
    time: new Date()
  });
  message.value = "" // empty input field
}

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

if (navigator.serviceWorker) {
  window.addEventListener('load', () => { // wait for loading to finish before registering sw
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
        if (result.outcome === 'accepted') alert('Family Chat is installed, have fun!')
      })
  })
}

let deferredPromptEvent // install promt
window.addEventListener('beforeinstallprompt', (e) => {
  deferredPromptEvent = e // stash event to trigger later

  let install = document.createElement("button")
  install.innerHTML = "Install"
  install.setAttribute("id", "install")
  send.parentNode.insertBefore(install, send.nextSibling)

  installHandler()
})

const share = () => {
  let navigator
  navigator = window.navigator

  if (navigator.share) {
    navigator.share({
      title: 'IDB Notes',
      text: 'IDB Notes React PWA',
      url: 'https://idbnotes.imfast.io/',
    })
      .then(() => alert('Sharing successfull'))
      .catch((error) => console.log('Error sharing', error));
  } else {
    alert('Sharing is supported only on mobile devices')
  }
}