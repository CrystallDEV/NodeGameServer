var express = require('express');
var app = express();
var msgpack = require('msgpack-lite');
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
    console.log('Redirecting client');
})

app.listen(3000, function () {
    console.log('Server listening on port 3000!')
})