//Server Side - Chat App - Titus Smith
var moment = require('moment');
var express = require('express');
var socket = require('socket.io');
var MongoClient = require('mongodb').MongoClient;

// App setup
var app = express();
PORT = process.env.PORT || 4000;
var server = app.listen(PORT, function () {
	console.log('listening for requests on port 4000,');
});

// Static files
app.use(express.static('public'));

// Socket setup & pass server
var io = socket(server);

var Filter = require('bad-words');
const customFilter = new Filter({ placeHolder: 'x' });

var users = [];
var onlineArray = new Array();
var offlineArray = new Array();

var id = 'some room';
var url =
	'mongodb+srv://titus:123@cluster0.mxlmb.mongodb.net/node_chat?retryWrites=true&w=majority';

const client = new MongoClient(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	connectTimeoutMS: 30000,
	keepAlive: 1,
});
(async () => {
	await client.connect();
	console.log('Connected');
	const db = client.db('node_chat');
	// const collection = databse.collection('private_messages');
	// var db = client.db('node_chat');
	var messagesCollection = db.collection('private_messages');
	var usersCollection = db.collection('all_users');
	var roomCollection = db.collection('general_messages');

	io.on('connection', (socket) => {
		console.log('Made socket connection', socket.id);
		socket.join(id);
		socket.on('online', function (id, uname) {
			// console.log(uname);
			socket.username = customFilter.clean(uname);
			users[socket.username] = socket.id;
			socket.broadcast.emit('online', socket.username);

			usersCollection.updateOne(
				{ username: socket.username },
				{ $set: { username: socket.username, status: 'online' } },
				{ upsert: true },
				function (err, res) {
					console.log('inserted user into database');
					//Loop through and find online and offline users
					usersCollection
						.find({})
						.forEach(function (row) {
							if (row.status == 'online') {
								if (!onlineArray.includes(row.username)) {
									onlineArray.push(row.username);
									offlineArray = offlineArray.filter(
										(val) => val !== row.username
									);
								}
							} else {
								if (!offlineArray.includes(row.username)) {
									offlineArray.push(row.username);
									onlineArray = onlineArray.filter(
										(val) => val !== row.username
									);
								}
							}
						})
						.then(function () {
							io.emit('users-online', offlineArray, onlineArray);
						});
				}
			);
			//Remove from offline list
			//offlineArray = offlineArray.filter(val => val !== uname);
		});

		//Loads all messages from private message database
		socket.on('private-load', function (otherName, yourName) {
			otherName = customFilter.clean(otherName);
			yourName = customFilter.clean(yourName);
			console.log(otherName);
			console.log(yourName);
			//Find any messages between the people
			messagesCollection
				.find({
					$or: [
						{ sender: yourName, receiver: otherName },
						{ sender: otherName, receiver: yourName },
					],
				})
				.forEach(function (row) {
					console.log(
						'Sender: ' +
							yourName +
							' Receiver: ' +
							otherName +
							' Message: ' +
							row.body
					);
					// var socketId = users[otherName];
					// io.to(socketId).emit('private-message', row.sender, row.body, row.timestamp);
					if (row.sender != row.receiver) {
						socket.emit('private-message', row.sender, row.body, row.timestamp);
					}
				});
		});
		//Loads all messages from general message database
		socket.on('room-load', function (room) {
			//Find any messages between the people
			roomCollection.find({ room: room }).forEach(function (row) {
				row.sender = customFilter.clean(row.sender);
				// console.log('Room: ' + room + ' Message: ' + row.body);
				// var socketId = users[otherName];
				//io.in(room).emit('chat', {handle: row.sender, message: row.body, timestamp: row.timestamp});
				socket.emit('chat', {
					handle: row.sender,
					message: row.body,
					timestamp: row.timestamp,
				});
			});
		});

		socket.on('private-message', function (otherName, yourName, message) {
			otherName = customFilter.clean(otherName);
			yourName = customFilter.clean(yourName);
			// yourName = customFilter.clean(yourName);
			var socketId = users[otherName];
			message = customFilter.clean(message);
			//Emit to other person and yourself
			io.to(socketId).emit(
				'private-message',
				yourName,
				message,
				moment().format('lll')
			);

			if (otherName != yourName) {
				//Don't print it out twice if someone is texting themselves
				socket.emit(
					'private-message',
					yourName,
					message,
					moment().format('lll')
				);
				if (!onlineArray.includes(otherName)) {
					console.log(': otherName');
					offlineMessage = 'Heads up: ' + otherName + ' is currently offline!';
					socket.emit('offline-notice', offlineMessage);
				}
			}

			// messages find id and increment
			messagesCollection.insertOne(
				{
					body: customFilter.clean(message),
					sender: yourName,
					receiver: otherName,
					timestamp: moment().format('lll'),
				},
				function (err, res) {
					console.log('inserted message into database');
				}
			);
		});
		socket.on('room-switch', function (id) {
			socket.join(id);
			socket.emit('room-switch', id);
		});
		socket.on('disconnect', function (id) {
			usersCollection.findOneAndUpdate(
				{ username: socket.username },
				{ $set: { status: 'offline' } },
				function (err, res) {
					console.log('updated' + socket.username + ' to offline');

					//Don't emit if username wasn't entered
					if (socket.username != null) {
						//Remove username
						socket.broadcast.emit('offline', socket.username);

						offlineArray.push(socket.username);
						//Remove name from online list
						onlineArray = onlineArray.filter((val) => val !== socket.username);
						io.emit('users-online', offlineArray, onlineArray);

						usersCollection.find({}).forEach(function (row) {});
					}
				}
			);
		});
		socket.on('chat', function (id, data) {
			data.handle = customFilter.clean(data.handle);
			roomCollection.insertOne(
				{
					body: customFilter.clean(data.message),
					sender: data.handle,
					room: id,
					timestamp: moment().format('lll'),
				},
				function (err, res) {
					console.log('inserted message into database');
				}
			);

			io.in(id).emit('chat', {
				message: customFilter.clean(data.message),
				handle: data.handle,
				timestamp: moment().format('lll'),
			});
			console.log(id);
		});

		// Handle typing event
		socket.on('typing', function (id) {
			socket.to(id).emit('typing', socket.username);
		});
	});
})();
