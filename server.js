var express = require('express');
var app = express();
/* can also do, var app = require('express')(); */
var server = require('http').Server(app);
var io = require('socket.io')(server);
var users = {}; //key-nick, value-socket

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');

});

//equiv to io.sockets.on - all socket code goes in this
io.on('connection', function(socket){
  
//new user joined
  socket.on('new user', function(data, callback){
    if(data in users){ //if user exists in array
      callback(false);  //pass an object in here later
      console.log("guest connected");
    } else {
      callback(true);
      socket.nickname = data; //storing nick of each user in its own socket
      /*each user has its own socket*/
      users[socket.nickname] = socket;
      updateNicknames();
      console.log(socket.nickname + " connected");
      socket.broadcast.emit('user joined', {nick:socket.nickname});
    }
  })

//update nicknames when someone new joins
  function updateNicknames() {
    io.emit('usernames', Object.keys(users));//sending nickname to client
  }

//send msg
  socket.on('send msg', function(msg){
		io.emit('new msg', {message:msg, nick: socket.nickname});
    //socket.broadcast.emit() - sends to all except sender
  });

//send pm
  socket.on('send pm', function(data) { //to is receiver
    console.log(socket.nickname + '->' + data.to + ': '+ data.msg);
    users[data.to].emit('new pm', {message:msg, receiver:data.to, nick:socket.nickname});
  });

//on disconnect
	socket.on('disconnect', function(data){
    if(!socket.nickname){
      return;
    }else {
      console.log(socket.nickname +' disconnected');
      io.emit('user left', {nick: socket.nickname});//send nick who left to client
      delete users[socket.nickname];
      updateNicknames();
    }
  });

});


server.listen(3000, function(){
	console.log("Server running on port 3000");
});
