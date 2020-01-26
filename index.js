'use strict'

const express = require('express');
const socket = require('socket.io');

const app = express();


app.get('/', function(req, res) {    // https redirection
    // console.log('req host ', req.headers.host)
    console.log('req url ',req.url)
    // console.log(req.secure)
    // res.redirect('https://' + req.headers.host + req.url);

    res.sendFile(__dirname + '/public/index.html');
})

app.get('/js/fChat-sw.js', function(req, res) { 
    res.setHeader('Service-Worker-Allowed', '/')
    res.sendFile(__dirname + '/public/js/fChat-sw.js');
})

app.use(express.static('public'));
// login/identifiaction?
// http/2?

const server = app.listen(8000, function () {
    console.log('listening for requests on port 8000,');
});

// Socket setup & pass server
const io = socket(server);
io.on('connection', (soc) => {
    console.log('socket connection id: ', soc.id);
    console.log('socket connection time: ', soc.handshake.time)
    
    soc.on('chat', function (data) {
        io.sockets.emit('chat', data);  // everyone gets it
    });

    // check if all participants got it
    // else store it for those offline, and send it again to recepient, once back online

    soc.on('typing', function (data) {
        soc.broadcast.emit('typing', data); // everyone gets it expect sender
        // e.emit('typing', data); // only sender gets it
    });
});
