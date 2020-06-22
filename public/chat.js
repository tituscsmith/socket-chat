// // Make connection
// var socket = io.connect('http://localhost:4000');
//
// // Query DOM
// var message = document.getElementById('message'),
//       handle = document.getElementById('handle'),
//       btn = document.getElementById('send'),
//       output = document.getElementById('output'),
//       feedback = document.getElementById('feedback'),
//       usernameButton = document.getElementById('submit');
//       allOnline = document.getElementById('all-online');
//
// document.getElementById('general-chat').style.display = "none";
//
//
// usernameButton.addEventListener('click', function(){
//   if(handle.value == ""){
//     return;
//   }
//
//     chatTitle = document.getElementById('chat-title');
//     chatTitle.innerHTML += "<br><em>" + handle.value + "</em>";
//
//    document.getElementById('general-chat').style.display = "block";
//    document.getElementById('user-bar').style.display = "none";
//
//    socket.emit('online', handle.value);//Let the server know someone is typing
//
// });
// //Listen for the message click
// //FIRST STEP
// btn.addEventListener('click', function(){
//   //Let the server know the message button has been clicked
//   if(message.value){
//      socket.emit('chat', {
//         message: message.value,
//          handle: handle.value
//      });
//     message.value = "";
//   }
//   console.log("Message is not empty");
//
// });
//
// //Listen for a keypress
// message.addEventListener('keypress', function(){
//     socket.emit('typing', handle.value);//Let the server know someone is typing
//     //Send their name
// })
// // Listen for events
// //THIRD STEP
// socket.on('chat', function(data){
//   //console.log("2");
//     feedback.innerHTML = '';//After we click send, make feedback message go away
//     output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
// });
//
// socket.on('typing', function(data){
//     feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
// });
// socket.on('online', function(data){
//     allOnline.innerHTML = arr;
//     output.innerHTML += '<p><em>' + data + ' is now online!</em></p>';
//     // allOnline.innerHTML += data;
// });
// socket.on('offline', function(data){
//   //  arr.pop();
//     //allOnline.innerHTML = arr;
//     allOnline.innerHTML = arr;
//     output.innerHTML += '<p><em>' + data + ' is now offline.</em></p>';
//     // allOnline.innerHTML -= data;
// });
// socket.on('all-online', function(data){
//     //arr.pop();
//     allOnline.innerHTML = "<strong>Online Users: </strong><br>" + data;
//   //  output.innerHTML += '<p><em>' + data + ' is now offline.</em></p>';
//     // allOnline.innerHTML -= data;
// });
// Make connection
var socket = io.connect('http://localhost:4000');
var userArray;
// Query DOM
var message = document.getElementById('message'),
      handle = document.getElementById('handle'),
      privateHandle = document.getElementById('private-handle'),
      btn = document.getElementById('send'),
      output = document.getElementById('output'),
      chatTitle = document.getElementById('chat-title'),
      privateTitle = document.getElementById('private-chat-title'),
      privateOutput = document.getElementById('private-output'),
      feedback = document.getElementById('feedback'),
      usernameButton = document.getElementById('submit'),
      room1 = document.getElementById('room1'),
      room2 = document.getElementById('room2'),
      room3 = document.getElementById('room3'),
      room4 = document.getElementById('room4'),
      allOffline = document.getElementById('all-offline'),
      privateButton = document.getElementById('private-send'),
      privateMessage = document.getElementById('private-message'),
      allOnline = document.getElementById('all-online');

document.getElementById('general-chat').style.display = "none";
document.getElementById('private-chat').style.display = "none";
var id = 'some room';
privateButton.addEventListener('click', function(){
  console.log(privateHandle.value);
//  privateTitle.innerHTML += " with <em>" + privateHandle.value + "</em>";
  if(privateHandle.value !== "" || privateMessage.value !== ""){
    socket.emit('private-message', privateHandle.value, handle.value, privateMessage.value);
    privateHandle.value = "";
    privateMessage.value = "";
  }
});

room1.addEventListener('click', function(){
  id = 'Room 1';
  console.log("Button1 clicked");
  room1.style.visibility = "hidden";
  room2.style.visibility = "visible";
  document.getElementById('general-chat').style.display = "block";
  socket.emit('room-switch', id);
  // output.innerHTML += '<p><strong> Switched to' + id + '</strong>' + '</p>';
});
room2.addEventListener('click', function(){
  id = 'Room 2';
  room1.style.visibility = "visible";
  room2.style.visibility = "hidden";
  document.getElementById('general-chat').style.display = "block";
  socket.emit('room-switch', id);
});
//Update room with button listener

usernameButton.addEventListener('click', function(){
  if(handle.value == ""){
    return;
  }

    chatTitle.innerHTML += "<br><em>" + handle.value + "</em>";
    privateTitle.innerHTML += "<br><em>" + handle.value + "</em>";
    document.getElementById('private-chat').style.display = "block";
    document.getElementById('title').style.display = "block";
    room1.style.visibility = "visible";
    room2.style.visibility = "visible";
   document.getElementById('user-bar').style.display = "none";

   socket.emit('online', id, handle.value);//Let the server know someone is typing
});
//Listen for the message click
//FIRST STEP
btn.addEventListener('click', function(){
  //Let the server know the message button has been clicked
  if(message.value){
     socket.emit('chat', id, {
        message: message.value,
         handle: handle.value
     });
    message.value = "";
  }
  console.log("Message is not empty: " + message.value);

});

//Listen for a keypress
message.addEventListener('keypress', function(id){
    socket.emit('typing', id, handle.value);
    //Send their name
})
// Listen for events
//THIRD STEP
socket.on('chat', function(data){
    feedback.innerHTML = '';//After we click send, make feedback message go away
    output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
});
socket.on('room-switch', function(data){
    output.innerHTML += '<p><strong> Switched to ' + data + '</strong>' + '</p>';
});
socket.on('typing', function(data){
    feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});
socket.on('online', function(data){
    output.innerHTML += '<p style="color:green;"><em>' + data + ' is now online!</em></p>';
});
socket.on('offline', function(data){
    output.innerHTML += '<p style="color:red;"><em>' + data + ' is now offline.</em></p>';
});
socket.on('private-message', function(otherHandle, message){
    console.log("ID is" + otherHandle);
    console.log(message);
    privateOutput.innerHTML += '<p><strong>' + otherHandle + ': </strong>' + message + '</p>';
});
socket.on('all-online', function(arr){
  console.log("allonline updated");
  userArray = arr;
    allOnline.innerHTML = "<strong>Online Users: </strong><br><p style= 'color:green;'>" + arr.join(" <br> ") + "</p>";
});
socket.on('all-offline', function(arr){
    console.log("alloffline updated");
    //userArray = arr;
    console.log(arr.join(" <br> "));
    allOffline.innerHTML = "<strong>Offline Users: </strong><br><p style= 'color:red;'>" + arr.join(" <br> ") + "</p>";
});
