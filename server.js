/*
https://www.npmjs.com/package/pi-gpio
*/

var gpio = require("pi-gpio");


var express=require('express'),
app=express(),
server=require('http').createServer(app),
io = require('socket.io',{transports: ['websocket']}).listen(server);
server.listen(3000);
var shortId = require('shortid');

//ip
var os = require( 'os' );
var networkInterfaces = os.networkInterfaces( );

//own modules
var IsPinAlreadyON = require('./IsPinAlreadyON.js');

//poder accedir al server i interactuar
app.use(express.static(__dirname + '/clientGPIO'));



var numconnections=0;
var listPinsON=[];
io.on('connection', function (socket) {
	socket.on('newconnection', function (data,callback){
		numconnections++;
		console.log("numconnections: " + numconnections);
		//io.sockets.emit('numconnections',{numconnections}); //aqí envia la data
	});
	socket.on('pinON', function (data,callback){
		console.log(data + "--> ON");

		//comprova si el pin està already encès
		if(IsPinAlreadyON.isit(listPinsON, data)==false)
		{
			listPinsON.push(data);
			console.log("listPinsON: " + listPinsON);
      gpio.open(data, "output", function(err) {		// Open pin per output
      	gpio.write(data, 1, function() {			// Set pin high (1)
      		gpio.close(data);						// Close pin
      	});
      });
			io.sockets.emit('listPinsON',listPinsON);
		}else{
			//pin already encès
			io.sockets.emit("alreadyON", data);
		}
	});

	socket.on('pinOFF', function (data,callback){
		console.log(data + "--> OFF");
		for(var i=0; i<listPinsON.length; i++)
		{
			if(listPinsON[i]==data)
			{
				listPinsON.splice(i, 1);
			}
		}

		console.log("listPinsON: " + listPinsON);
		gpio.open(data, "output", function(err) {		// Open pin per output
			gpio.write(data, 0, function() {			// Set pin low (0)
				gpio.close(data);						// Close pin
			});
		});
		io.sockets.emit('listPinsON',listPinsON); //aqí envia la data
	});


});



console.log("------- server is running -------");
