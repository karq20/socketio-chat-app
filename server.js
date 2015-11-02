var express = require('express');
var app = express();
/* can also do,
	var app = require('express')(); */
var server = require('http').Server(app);

var io = require('socket.io')(server);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	
  	socket.on('chat', function(msg){
  		//console.log('message: ' + msg);
  		io.emit('chat', msg);
  		//socket.broadcast.emit('chat message', msg);
  	});

	socket.on('disconnect', function(){
    	console.log('user disconnected');
  	});

});

server.listen(3000, function(){
	console.log("Server running on port 3000");
});