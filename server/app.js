var WebSocketServer = require('uws').Server;
var wss = new WebSocketServer({ port: 40510 });

//msgpack
var msgpack = require("msgpack-lite");

var SOCKET_LIST = {};
var PLAYER_LIST = {};

var Player = function (id) {
    var self = {
        x: 250,
        y: 250,
        id: id,
        number: "" + Math.floor(10 * Math.random()),
        pressingLeft: false,
        pressingUp: false,
        pressingRight: false,
        pressingDown: false,
        speed: 2
    };
    self.updatePosition = function () {
        if (self.pressingLeft)
            self.x -= self.speed;
        if (self.pressingUp)
            self.y -= self.speed;
        if (self.pressingRight)
            self.x += self.speed;
        if (self.pressingDown)
            self.y += self.speed;

        if (self.y > 520) {
            self.y = 0;
        } else if (self.y < -10) {
            self.y = 500;
        }

        if (self.x > 510) {
            self.x = 0;
        } else if (self.x < -10) {
            self.x = 500;
        }
    };
    return self;
}

wss.on('connection', function (ws) {
    ws.id = Math.random();
    SOCKET_LIST[ws.id] = ws;

    var player = Player(ws.id);
    PLAYER_LIST[ws.id] = player;
    console.log('player connected (' + ws.id + ')');

    ws.on('close', function () {
        delete SOCKET_LIST[ws.id];
        delete PLAYER_LIST[ws.id];
    });

    ws.on('message', function (message) {
        var data = JSON.parse(message);
        if (data.type === 'keyPress') {
            //TODO add movestate and only update the movestate class
            if (data.inputId === 'left')
                player.pressingLeft = data.state;
            else if (data.inputId === 'up')
                player.pressingUp = data.state;
            else if (data.inputId === 'right')
                player.pressingRight = data.state;
            else if (data.inputId === 'down')
                player.pressingDown = data.state;
        } else {
            console.log("other");
        }
    });
});

setInterval(function () {
    var pack = {};
    var array = []
    //update all players position
    for (var i in PLAYER_LIST) {
        var player = PLAYER_LIST[i];
        player.updatePosition();
        array.push({
            x: player.x,
            y: player.y,
            number: player.number
        });
    }
    pack.type = "newPosition"
    pack.players = array;
    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.send(JSON.stringify(pack));
    }
}, 1000 / 60);