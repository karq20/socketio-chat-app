var express = require('express');
var app = express();
/* can also do, var app = require('express')(); */
var server = require('http').Server(app);
var io = require('socket.io')(server);
var nicknames = [];

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');

});

//equiv to io.sockets.on - all socket code goes in this
io.on('connection', function(socket){
  
  
  socket.on('new user', function(nick, callback){
    if(nicknames.indexOf(nick) != -1){ //if nick exists in array
      callback(false);  //pass an object in here later
      console.log("guest connected");
    } else {
      callback(true);
      socket.nickname = nick; //storing nick of each user in its own socket
      /*each user has its own socket*/
      nicknames.push(socket.nickname);
      updateNicknames();
      console.log(socket.nickname + " connected");
      socket.broadcast.emit('user joined', {nick:socket.nickname});
    }
  })

  function updateNicknames() {
    io.emit('usernames', nicknames);
  }


  socket.on('send msg', function(msg){
		io.emit('new msg', {message:msg, nick: socket.nickname});
    //socket.broadcast.emit() - sends to all except sender
  });

  //update nicknames when someone new joins

	socket.on('disconnect', function(data){
    if(!socket.nickname){
      console.log("guest disconnected");
      return;
    }else {
      console.log(socket.nickname +' disconnected');
      io.emit('user left', {nick: socket.nickname});//send nick who left to client
      nicknames.splice(nicknames.indexOf(socket.nickname), 1);
      updateNicknames();
    }
  });

});


server.listen(3000, function(){
	console.log("Server running on port 3000");
});
