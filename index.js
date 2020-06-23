var express = require('express');
var socket = require('socket.io');

// App setup
var app = express();
var server = app.listen(4000, function(){
    console.log('listening for requests on port 4000,');
});

// Static files
app.use(express.static('public'));

// Socket setup & pass server
var io = socket(server);
var onlineArray = new Array();
var offlineArray = new Array();
var users = [];

var id = 'some room';

io.on('connection', (socket) => {
  console.log('Made socket connection', socket.id);
  socket.join(id);
  socket.on('online', function(id, uname){
       socket.username = uname;
      users[socket.username] = socket.id;
      console.log(socket.username + "=" + users[socket.username]);
       // socket.to(id).emit('online', socket.username);
       socket.broadcast.emit('online', socket.username);

       onlineArray.push(uname);
       // io.emit('all-online', onlineArray);
       //Remove from offline list
       offlineArray = offlineArray.filter(val => val !== uname);
      // io.emit('all-offline', offlineArray);
      io.emit('users-online', offlineArray, onlineArray);


   });
   socket.on('private-message', function(otherName, yourName, message) {
     console.log("PM Received" + otherName + " " + socketId);
     var socketId = users[otherName];
     // socket.emit('room-switch', id);
     io.to(socketId).emit('private-message', yourName, message);
     socket.emit('private-message', yourName, message);


   });
   socket.on('room-switch', function(id) {
     socket.join(id);
     socket.emit('room-switch', id);
   });
   socket.on('disconnect', function(id) {
     console.log("DISCONNECTED CALLED" + id)
       if (socket.username) {
           console.log( socket.username + " disconnected");
       } else {
           console.log('socket disconnected before username set');
       }
       //Don't emit if username wasn't entered
       if(socket.username!=null){
         //Remove username
         // socket.to(id).emit('offline', socket.username);
         socket.broadcast.emit('offline', socket.username);

         offlineArray.push(socket.username);
         //Remove name from online list
         onlineArray = onlineArray.filter(val => val !== socket.username);
         // io.emit('all-online', onlineArray);
         io.emit('users-online', offlineArray, onlineArray);


         console.log("emitting to all offline" + socket.username);
         console.log(offlineArray);
       }
   });
    socket.on('chat', function(id, data){
        io.in(id).emit('chat', data);
        console.log(id);
    });

    // Handle typing event
    socket.on('typing', function(id){
      console.log("RT is typing");
        socket.to(id).emit('typing', socket.username);

    });

});
