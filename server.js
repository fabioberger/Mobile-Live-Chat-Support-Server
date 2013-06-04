/**
* Module Dependencies
*/

var WebSocketServer = require('ws').Server;
var mongoose = require('mongoose');
var fs = require('fs');

// Bootstrap db connection
mongoose.connect('mongodb://localhost/test');

// Bootstrap models
var models_path = __dirname + '/app/models';
fs.readdirSync(models_path).forEach(function (file) {
  require(models_path+'/'+file);
});

var chat = require('./app/controllers/chat');

var web_socket_server      = new WebSocketServer({port: 5000, disableHixie: true});
var web_sockets            = {};
var web_socket_primary_key = -1;

//Initialize chat connection
chat.init(1, 1, function(err, conversation) {
  if(err) {
    // TODO: Send Error via web_socket to client & return [incorrect company publicKey]
    console.log(err);
  }
});


// if(chat_obj.stat == "error") { web_socket.send(JSON.stringify(chat_obj)); } //Send error msg to client. Return?!?
// TODO: else extract assigned agent & init agent connection & piping of msgs
// Send over any exisiting conversation messages or greeting message


web_socket_server.on('connection', function(web_socket) {

  // Add newly created web_socket to web_sockets.
  var web_socket_id = ++web_socket_primary_key;
  web_sockets[web_socket_id] = web_socket;

  web_socket.on('message', function(message) {
    // console.log("message: " + message);

    var msg_obj = JSON.parse(message); // TODO: Rescue and return error.
    switch (msg_obj.messageType) {

      case "connect": // eg. { "messageType": "connect", "companyKey": 1, "customerId": 1 }
        chat.init(msg_obj.companyKey, msg_obj.customerId);
      break;

      // Add cases here!
    }

  });

  web_socket.on('close', function() {
    delete web_sockets[web_socket_id];
  });

});
