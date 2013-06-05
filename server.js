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

web_socket_server.on('connection', function(web_socket) {

  // Add newly created web_socket to web_sockets.
  var web_socket_id = ++web_socket_primary_key;
  web_sockets[web_socket_id] = web_socket;

  var redisKey = "";

  web_socket.on('message', function(message) {

    console.log("Request received: "+message);

    // Move into JSONHelper
    var JSONH = require('./app/helpers/JSONHelper');
    var msg = JSONH.parseJSON(message);
    switch (msg.messageType) {
      // Error Case
      case 0:
        return web_socket.send(JSON.stringify(msg));
      break;

      // Connect Case
      case 1: // eg. { "messageType": 1, "companyKey": 1, "deviceId": 1 }
        //Initialize chat connection
        // Move code block into web_socket callbacks & uncomment web_socket calls
        // ar msg = { "type": "connect", "companyKey": 1, "deviceId": 1 };
        chat.init(msg.companyKey, msg.deviceId, function(err, conversation) {
          if(err) {
            // TODO: Send Error via web_socket to client & return [incorrect company publicKey]
            console.log(err);
            return web_socket.send(JSON.stringify({messageType: 0, error: err.message}));
          }
          var init_response = chat.createInitResponse(conversation);
          redisKey = conversation.redisKey;
          console.log(init_response);
          web_socket.send(JSON.stringify(init_response));
        });
      break;

      // Incoming Message
      case 2: 
        // Insert into Redis
      break;

      // Add cases here!
    }

  });

  web_socket.on('close', function() {
    delete web_sockets[web_socket_id];
  });

});
