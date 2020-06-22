// var express = require('express');
// var socket = require('socket.io');
//
// // App setup
// var app = express();
// var server = app.listen(4000, function(){
//     console.log('listening for requests on port 4000,');
// });
//
// // Static files
// app.use(express.static('public'));
//
// // Socket setup & pass server
// var io = socket(server);
// var onlineArray = new onlineArrayay();
//
//
// io.on('connection', (socket) => {
//   console.log('made socket connection', socket.id);
//   socket.on('online', function( uname ){
//        socket.username = uname;
//        console.log("Added uname");
//        onlineArray.push(uname);
//        io.sockets.emit('online', uname);
//        io.sockets.emit('all-online', onlineArray);
//    });
//
//    socket.on('disconnect', function( ) {
//        if (socket.username) {
//            console.log( socket.username + " disconnected");
//        } else {
//            console.log('socket disconnected before username set');
//        }
//        //Don't emit if username wasn't entered
//        if(socket.username!=null){
//     //   onlineArray.remove(socket.username);
//          onlineArray = onlineArray.filter(val => val !== socket.username);
//         console.log("removing");
//         // onlineArray.pop();
//          io.sockets.emit('all-online', onlineArray);
//          io.sockets.emit('offline', socket.username);
//        }
//    });
//     socket.on('chat', function(data){
//         //Send to every other user
//         io.sockets.emit('chat', data);
//       //Don't send to yourself?
//         //socket.broadcast.emit('chat', data);
//     });
//
//     // Handle typing event
//     socket.on('typing', function(data){
//       //emit to every other single client, but not the original sender
//         socket.broadcast.emit('typing', data);
//     });
//
// });
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
  console.log("CONNECTION MADE")
  console.log('made socket connection', socket.id);
  console.log(socket.id);
  socket.join(id);
  socket.on('online', function(id, uname){
       socket.username = uname;
      users[socket.username] = socket.id;
      console.log(socket.username + "=" + users[socket.username]);
       socket.to(id).emit('online', socket.username);

       onlineArray.push(uname);
       io.emit('all-online', onlineArray);
       //Remove from offline list
       offlineArray = offlineArray.filter(val => val !== uname);
      io.emit('all-offline', offlineArray);


   });
   socket.on('private-message', function(otherName, yourName, message) {
     console.log("PM Received" + otherName);
     var socketId = users[otherName];
     // socket.emit('room-switch', id);
     console.log(socketId);
     io.to(socketId).emit('private-message', yourName, message);
     socket.emit('private-message', yourName, message);


   });
   socket.on('room-switch', function(id) {
     socket.join(id);
     socket.emit('room-switch', id);
   });
   socket.on('disconnect', function(id) {
     console.log("DISCONNECTED CALLED")
       if (socket.username) {
           console.log( socket.username + " disconnected");
       } else {
           console.log('socket disconnected before username set');
       }
       //Don't emit if username wasn't entered
       if(socket.username!=null){
         //Remove username
         socket.to(id).emit('offline', socket.username);

         offlineArray.push(socket.username);
         io.emit('all-offline', offlineArray);
         //Remove name from online list
         onlineArray = onlineArray.filter(val => val !== socket.username);
         io.emit('all-online', onlineArray);

         console.log("emitting to all offline" + socket.username);
         console.log(offlineArray);
       }
   });
    socket.on('chat', function(id, data){
        io.in(id).emit('chat', data);
        console.log(id);
    });

    // Handle typing event
    socket.on('typing', function(id, data){
      console.log("RT");
        socket.to(id).emit('typing', data);

    });

});
