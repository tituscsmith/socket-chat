//Client Side - Chat App - Titus Smith

// Make connection
var socket = io.connect('https://socket-chat-titus.herokuapp.com');
// var socket = io.connect('http://localhost:4000');

//Need to enter swear word filtering

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
	allOffline = document.getElementById('all-offline'),
	privateButton = document.getElementById('private-send'),
	privateMessage = document.getElementById('private-message'),
	allOnline = document.getElementById('all-online'),
	privateSubtitle = document.getElementById('private-chat-subtitle'),
	privateSelect = document.getElementById('private-users');
const numRooms = 4;

var id = 'some room';
privateSelect.addEventListener('change', function () {
	if (
		privateSelect.value == 'default' &&
		privateSelect.options[0].text == 'Close Private Chat'
	) {
		document.getElementById('private-chat').style.visibility = 'hidden';
		privateSelect.options[0].text = 'Private Message Someone:';
		return;
	} else if (privateSelect.value == 'default') {
		return;
	} else {
		//Clear out messages when we switch
		privateOutput.innerHTML = '';
		privateSelect.options[0].text = 'Close Private Chat';
		privateSubtitle.innerHTML =
			'<br/>Messaging:  <em>' + privateSelect.value + '</em>';
		document.getElementById('private-chat').style.visibility = 'visible';

		//Load all previous messages
		socket.emit('private-load', privateSelect.value, handle.value);
	}
});

privateButton.addEventListener('click', function () {
	if (privateSelect.value !== '' || privateMessage.value !== '') {
		socket.emit(
			'private-message',
			privateSelect.value,
			handle.value,
			privateMessage.value
		);
		// privateSelect.value = "";
		privateMessage.value = '';
	}
});

function roomHandler(roomNumber) {
	output.innerHTML = ''; //Clear room

	if (
		id == 'Room ' + roomNumber &&
		document.getElementById('general-chat').style.visibility == 'visible'
	) {
		document.getElementById('general-chat').style.visibility = 'hidden';
	} else {
		id = 'Room ' + roomNumber;
		document.getElementById('general-chat').style.visibility = 'visible';
		socket.emit('room-switch', id);
		socket.emit('room-load', id);
	}
}
function leaveRoom() {
	// socket.emit('disconnect');
	window.location.reload();
}
//Update room with button listener

usernameButton.addEventListener('click', function () {
	if (handle.value == '') {
		return;
	}

	// chatSubtitle.innerHTML = '<br><em>' + handle.value + '</em>';
	//document.getElementById('title').style.visibility = "visible";
	document.getElementById('online-box').style.visibility = 'visible';
	document.getElementById('private-users').style.visibility = 'visible';
	document.getElementById('leave').style.visibility = 'visible';

	//Make all the buttons visible
	for (var i = 1; i <= numRooms; i++) {
		document.getElementById('room' + i).style.visibility = 'visible';
	}

	document.getElementById('user-bar').style.display = 'none';

	socket.emit('online', id, handle.value); //Let the server know someone is typing
});
//Listen for the message click
//FIRST STEP
btn.addEventListener('click', function () {
	//Let the server know the message button has been clicked
	if (message.value) {
		socket.emit('chat', id, {
			message: message.value,
			handle: handle.value,
		});
		message.value = '';
	}
	console.log('Message is not empty: ' + message.value);
});

//Listen for a keypress
message.addEventListener('keypress', function () {
	socket.emit('typing', id);
	//Send their name
});
// Listen for events
//THIRD STEP
socket.on('chat', function (data) {
	feedback.innerHTML = ''; //After we click send, make feedback message go away
	output.innerHTML +=
		'<p word-wrap = "break-word"><strong>' +
		data.handle +
		':</strong> ' +
		data.message +
		'<br /><small class = "right"> ' +
		data.timestamp +
		'</small></p>';
	// output.innerHTML +=
	// 	'<p><span class="left"><strong>' +
	// 	data.handle +
	// 	': </strong>' +
	// 	data.message +
	// 	'</span><span class="right">' +
	// 	data.timestamp +
	// 	'</span></p>';
});
socket.on('room-switch', function (data) {
	// output.innerHTML += '<p><strong> Switched to ' + data + '</strong>' + '</p>';
	// chatSubtitle.innerHTML = '<br/><p><strong>' + data + '</strong>' + '</p>';
	chatSubtitle.innerHTML = '<br/>' + data;
});
socket.on('typing', function (data) {
	feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});
socket.on('online', function (data) {
	output.innerHTML +=
		'<p style="color:green;"><em>' + data + ' is now online!</em></p>';
});
socket.on('offline', function (data) {
	output.innerHTML +=
		'<p style="color:red;"><em>' + data + ' is now offline.</em></p>';
});
socket.on('private-message', function (otherHandle, message, timestamp) {
	privateOutput.innerHTML +=
		'<p word-wrap = "break-word"><strong>' +
		otherHandle +
		':</strong> ' +
		message +
		'<br /><small class = "right"> ' +
		timestamp +
		'</small></p>';
	// privateOutput.innerHTML +=
	// 	'<p><span class="left"><strong>' +
	// 	otherHandle +
	// 	': </strong>' +
	// 	message +
	// 	'</span><span class="right">' +
	// 	timestamp +
	// 	'</span></p>';
});
socket.on('offline-notice', function (message) {
	privateOutput.innerHTML +=
		'<p style="color:orange;"><em>' + message + '</em></p>';
});
socket.on('users-online', function (offlinearr, onlinearr) {
	//updateUsers(onlinearr)
	//Display the users on left hand
	totalUsers(onlinearr, offlinearr);
	allOnline.innerHTML =
		"<strong>Online Users: </strong><br><p style= 'color:green;'>" +
		onlinearr.join(' <br> ') +
		'</p>';
	allOffline.innerHTML =
		"<strong>Offline Users: </strong><br><p style= 'color:red;'>" +
		offlinearr.join(' <br> ') +
		'</p>';
});
//function to remove offline users and add online users
function totalUsers(onlinearr, offlinearr) {
	var allusers = onlinearr.concat(offlinearr);
	for (let val of allusers) {
		var found = false;
		for (i = 0; i < privateSelect.length; i++) {
			if (privateSelect.options[i].value == val) {
				found = true;
				break;
			}
		}
		if (!found) {
			addUser(val);
		}
	}
}
function addUser(data) {
	var option = document.createElement('option');
	option.value = data;
	option.text = data;
	privateSelect.add(option);
}
