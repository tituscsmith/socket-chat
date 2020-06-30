//Server Side - Chat App - Titus Smith

var express = require('express');
var socket = require('socket.io');
var MongoClient = require('mongodb').MongoClient;

// App setup
var app = express();
var server = app.listen(4000, function(){
    console.log('listening for requests on port 4000,');
});

// Static files
app.use(express.static('public'));

var url = 'mongodb://localhost:27017'
// Socket setup & pass server
var io = socket(server);
var users = [];
var onlineArray = new Array();
var offlineArray = new Array();

var id = 'some room';
MongoClient.connect(url, function(err, client){
   var db = client.db('node_chat');
   var messagesCollection = db.collection('private-messages');
   var usersCollection = db.collection('all-users');
   var roomCollection = db.collection('general-messages');


  io.on('connection', (socket) => {
    var seqNum = 1;

    console.log('Made socket connection', socket.id);
    socket.join(id);
    socket.on('online', function(id, uname){
         socket.username = uname;
        users[socket.username] = socket.id;
        console.log(socket.username + "=" + users[socket.username]);
         socket.broadcast.emit('online', socket.username);

         usersCollection.updateOne({username: uname}, {$set: {username: uname, status: "online"}}, {upsert: true}, function(err, res){
              console.log("inserted user into database");
              //Loop through and find online and offline users
           usersCollection.find({}).forEach(function(row){
             if(row.status == "online"){
               if(!onlineArray.includes(row.username)){
                 console.log("online" + row.username);
                 onlineArray.push(row.username);
                 offlineArray = offlineArray.filter(val => val !== row.username);
               }
             }
             else{
               console.log("offline" + row.username + " " + row.status);
               if(!offlineArray.includes(row.username)){
                  offlineArray.push(row.username);
                  onlineArray = onlineArray.filter(val => val !== row.username);
               }
               console.log(offlineArray);
             }
           }).then(function(){
             io.emit('users-online', offlineArray, onlineArray);
             console.log("Offline Array:" + offlineArray);
             console.log("Online Array:" +onlineArray);
           });
        });
         //Remove from offline list
         //offlineArray = offlineArray.filter(val => val !== uname);
     });

     //Loads all messages from private message database
     socket.on('private-load', function(otherName, yourName) {
       //Find any messages between the people
       messagesCollection.find( {$or: [{sender: yourName, receiver: otherName}, {sender: otherName, receiver: yourName}]}).forEach(function(row){
         console.log("Sender: " + yourName + " Receiver: " + otherName + " Message: " + row.body);
         var socketId = users[otherName];
         io.to(socketId).emit('private-message', row.sender, row.body);
         if(row.sender!=row.receiver){
            socket.emit('private-message', row.sender, row.body);
          }
       });
     });
     //Loads all messages from general message database
     socket.on('room-load', function(room) {
       //Find any messages between the people
       roomCollection.find( {room: room}).forEach(function(row){
         console.log("Room: " + room + " Message: " + row.body);
         // var socketId = users[otherName];
         io.in(room).emit('chat', {handle: row.sender, message: row.body});
       });
     });

     socket.on('private-message', function(otherName, yourName, message) {
       console.log("PM Received" + otherName + " " + socketId);
       var socketId = users[otherName];

       //Emit to other person and yourself
       io.to(socketId).emit('private-message', yourName, message);

       if(otherName!=yourName){//Don't print it out twice if someone is texting themselves
         socket.emit('private-message', yourName, message);
       }
       seqNum++;//increment sequence number

      // messages find id and increment
       messagesCollection.insertOne({body: message,
          sender: yourName,
          receiver: otherName,
          seqNum: seqNum}, function(err, res){
            console.log("inserted message into database");
          })
     });
     socket.on('room-switch', function(id) {
       socket.join(id);
       socket.emit('room-switch', id);
     });
     socket.on('disconnect', function(id) {
       usersCollection.findOneAndUpdate({username: socket.username}, {$set: {status: "offline"}}, function(err, res){
            console.log("updated" + socket.username + " to offline");

         //Don't emit if username wasn't entered
         if(socket.username!=null){
           //Remove username
           socket.broadcast.emit('offline', socket.username);

           offlineArray.push(socket.username);
           //Remove name from online list
           onlineArray = onlineArray.filter(val => val !== socket.username);
           io.emit('users-online', offlineArray, onlineArray);
           console.log("Offline Array:" + offlineArray);
           console.log("Online Array:" +onlineArray);

             usersCollection.find({}).forEach(function(row){
             });
         }
      });
     });
      socket.on('chat', function(id, data){
        roomCollection.insertOne({body: data.message,
           sender: data.handle,
           room: id,
           seqNum: seqNum}, function(err, res){
             console.log("inserted message into database");
           })

          io.in(id).emit('chat', data);
          console.log(id);
      });

      // Handle typing event
      socket.on('typing', function(id){
        console.log("RT is typing");
          socket.to(id).emit('typing', socket.username);

      });

  });
});
