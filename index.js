'use strict'

var sslRedirect = require('heroku-ssl-redirect');   //  https://medium.com/@thiscodeworks.com/how-to-redirect-your-node-js-app-hosted-on-heroku-from-http-to-https-50ef80130bff
const express = require('express'),
    socket = require('socket.io'),
    app = express(),
    port = process.env.PORT || 8000;  // optional for deployment

// https redirection
app.use(sslRedirect());


// app.get("*", function (request, response) {
//     response.redirect("https://" + request.headers.host + request.url);
// });

// app.use(function (request, response) {
//     if (!request.secure) {
//         response.redirect("https://" + request.headers.host + request.url);
//     }
// });

app.get('/', function (req, res) {
    // console.log('req host ', req.headers.host)
    console.log('req url ', req.url)
    // console.log(req.secure)
    // res.redirect('https://' + req.headers.host + req.url);

    res.sendFile(__dirname + '/public/index.html');
})

app.get('/online/', function (req, res) {    // https redirection
    console.log('online')
    res.sendFile(__dirname + '/public/online/index.html');
})

app.get('/js/fChat-sw.js', function (req, res) {
    res.setHeader('Service-Worker-Allowed', '/')
    res.sendFile(__dirname + '/public/js/fChat-sw.js');
})

app.use(express.static('public'));
// login/identifiaction?
// http/2?

const server = app.listen(port, function () {
    console.log(`listening for requests on port ${port}`);
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
