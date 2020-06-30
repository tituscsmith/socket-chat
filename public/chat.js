//Client Side - Chat App - Titus Smith

// Make connection
var socket = io.connect('http://localhost:4000');
var userArray;
// Query DOM
var message = document.getElementById('message'),
      handle = document.getElementById('handle'),
      btn = document.getElementById('send'),
      output = document.getElementById('output'),
      chatTitle = document.getElementById('chat-title'),
      chatSubtitle = document.getElementById('chat-subtitle'),
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
      allOnline = document.getElementById('all-online'),
      privateSubtitle = document.getElementById('private-chat-subtitle'),
      privateSelect = document.getElementById('private-users');

var id = 'some room';

privateSelect.addEventListener("change", function() {

  if(privateSelect.value=="default" && privateSelect.options[0].text=="Close Private Chat"){
    console.log("if");
    document.getElementById('private-chat').style.visibility = "hidden";
    privateSelect.options[0].text = "Choose someone to private message:";
    return;
  }
  else if(privateSelect.value=="default"){
    console.log("else if");
    return;
  }

  else{
    //Clear out messages when we switch
    privateOutput.innerHTML = '';
    console.log("else");
    privateSelect.options[0].text = "Close Private Chat";
    privateSubtitle.innerHTML = "<br>" + handle.value + "</em> talking to  <em>" + privateSelect.value + "</em>";
    document.getElementById('private-chat').style.visibility = "visible";

    //Load all previous messages
    socket.emit('private-load', privateSelect.value, handle.value);

  }

});

privateButton.addEventListener('click', function(){
  console.log(privateSelect.value);
  if(privateSelect.value !== "" || privateMessage.value !== ""){
    socket.emit('private-message', privateSelect.value, handle.value, privateMessage.value);
    privateSelect.value = "";
    privateMessage.value = "";
  }

});

room1.addEventListener('click', function(){
  output.innerHTML = '';//Clear room
  id = 'Room 1';
  console.log("Button1 clicked");
  room1.style.visibility = "hidden";
  room2.style.visibility = "visible";
  document.getElementById('general-chat').style.visibility = "visible";
  socket.emit('room-switch', id);
  socket.emit('room-load', 'Room 1');
});
room2.addEventListener('click', function(){
  output.innerHTML = '';//Clear room
  id = 'Room 2';
  room1.style.visibility = "visible";
  room2.style.visibility = "hidden";
  document.getElementById('general-chat').style.visibility = "visible";
  socket.emit('room-switch', id);
  socket.emit('room-load', 'Room 2');

});
//Update room with button listener

usernameButton.addEventListener('click', function(){
  if(handle.value == ""){
    return;
  }

    chatSubtitle.innerHTML = "<br><em>" + handle.value + "</em>";
    document.getElementById('title').style.visibility = "visible";
    document.getElementById('online-box').style.visibility = "visible";
    document.getElementById('private-users').style.visibility = "visible";

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
message.addEventListener('keypress', function(){
    socket.emit('typing', id);
    //Send their name
})
// Listen for events
//THIRD STEP
socket.on('chat', function(data){
    feedback.innerHTML = '';//After we click send, make feedback message go away
    output.innerHTML += '<p><span class="left"><strong>' + data.handle + ': </strong>' + data.message + '</span><span class="right">' + data.timestamp +'</span></p>';
});
socket.on('room-switch', function(data){
    output.innerHTML += '<p><strong> Switched to ' + data + '</strong>' + '</p>';
});
socket.on('typing', function(data){
  console.log("Typing");
    feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});
socket.on('online', function(data){
  console.log("online received");
    output.innerHTML += '<p style="color:green;"><em>' + data + ' is now online!</em></p>';
});
socket.on('offline', function(data){
  console.log("offline received");
    output.innerHTML += '<p style="color:red;"><em>' + data + ' is now offline.</em></p>';
});
socket.on('private-message', function(otherHandle, message, timestamp){
    console.log("ID is" + otherHandle);
    console.log(message);
    privateOutput.innerHTML += '<p><span class="left"><strong>' + otherHandle + ': </strong>' + message + '</span><span class="right">' + timestamp +'</span></p>';
});
socket.on('users-online', function(offlinearr, onlinearr){
  console.log("allonline updated");
  //updateUsers(onlinearr)
  //Display the users on left hand
  totalUsers(onlinearr, offlinearr);
    allOnline.innerHTML = "<strong>Online Users: </strong><br><p style= 'color:green;'>" + onlinearr.join(" <br> ") + "</p>";
    allOffline.innerHTML = "<strong>Offline Users: </strong><br><p style= 'color:red;'>" + offlinearr.join(" <br> ") + "</p>";

});
//function to remove offline users and add online users
function totalUsers(onlinearr, offlinearr){
  var allusers = onlinearr.concat(offlinearr);
  for(let val of allusers){
    console.log(val);

    var found = false;
    for (i=0; i<privateSelect.length; i++) {
        if(privateSelect.options[i].value==val){
          found = true;
          break;
        }
    }
    console.log(val);
    console.log(onlinearr);

    if(found == false){
      addUser(val);
    }
  }
}
function addUser(data) {
  var option = document.createElement("option");
  option.value = data;
  option.text = data;
  privateSelect.add(option);
  console.log("added option");
}
