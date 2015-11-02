Introduction

Writing a chat application with popular web applications stacks like LAMP (PHP) has traditionally been very hard. It involves polling the server for changes, keeping track of timestamps, and it’s a lot slower than it should be.

Sockets have traditionally been the solution around which most realtime chat systems are architected, providing a bi-directional communication channel between a client and a server.

This means that the server can push messages to clients. Whenever you write a chat message, the idea is that the server will get it and push it to all other connected clients.

The Web Framework

The first goal is to setup a simple HTML webpage that serves out a form and a list of messages. We’re going to use the Node.JS web framework express to this end.

First let’s create a package.json manifest file that describes our project. I recommend you place it in a dedicated empty directory. Alternately you can run 'npm init'.

Now that express is installed we can create an index.js file that will setup our application.

/********************
var app = require('express')();
var http = require('http').Server(app);

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
********************/

This translates into the following:

->	Express initializes app to be a function handler that you can supply to an HTTP server (as seen in line 2).
->	We define a route handler / that gets called when we hit our website home.
->	We make the http server listen on port 3000.

If you run 'node index.js' and if you point your browser to http://localhost:3000.

Serving HTML

So far in index.js we’re calling res.send and pass it a HTML string. Our code would look very confusing if we just placed our entire application’s HTML there. Instead, we’re going to create a index.html file and serve it.

Let’s refactor our route handler to use sendFile instead:

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

And populate index.html with some html and css.

-----------------------------
Integrating Socket.IO

Socket.IO is composed of two parts:

->	A server that integrates with (or mounts on) the Node.JS HTTP Server: socket.io
->	A client library that loads on the browser side: socket.io-client

After installing it, add the following to server.js:
/*******************
var io = require('socket.io')(http);
io.on('connection', function(socket){
  console.log('a user connected');
});
*******************/
Notice that I initialize a new instance of socket.io by passing the http (the HTTP server) object. Then I listen on the connection event for incoming sockets, and I log it to the console.

Now in index.html I add the following snippet before the </body>:

<script src="/socket.io/socket.io.js"></script>
<script>
  var socket = io();
</script>

That’s all it takes to load the socket.io-client, which exposes a io global, and then connect.

Notice that I’m not specifying any URL when I call io(), since it defaults to trying to connect to the host that serves the page.
-------------------------
Emitting events

The main idea behind Socket.IO is that you can send and receive any events you want, with any data you want. Any objects that can be encoded as JSON will do, and binary data is supported too.

Let’s make it so that when the user types in a message, the server gets it as a chat message event.
In the html, add the following:

  var socket = io();
  $('form').submit(function(){
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });

And in index.js we print out the chat message event:

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
});
------------------------------------
Broadcasting

The next goal is for us to emit the event from the server to the rest of the users.

In order to send an event to everyone, Socket.IO gives us the io.emit:

io.emit('some event', { for: 'everyone' });

If you want to send a message to everyone except for a certain socket, we have the broadcast flag:

io.on('connection', function(socket){
  socket.broadcast.emit('hi');
});

In this case, for the sake of simplicity we’ll send the message to everyone, including the sender.

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

And on the client side when we capture a chat message event we’ll include it in the page. The total client-side JavaScript code now amounts to:

socket.on('chat message', function(msg){
	$('#messages').append($('<li>').text(msg));
});



Homework
--------
Here are some ideas to improve the application:

->	Broadcast a message to connected users when someone connects or disconnects
->	Add support for nicknames
->	Don’t send the same message to the user that sent it himself. Instead, append the message directly as soon as he presses enter.
->	Add “{user} is typing” functionality
->	Show who’s online
->	Add private messaging

















