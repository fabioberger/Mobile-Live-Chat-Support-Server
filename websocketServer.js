/**
* Module Dependencies
*/

// Third Party Modules
var WebSocketLib = require('ws');
var WebSocketServer = WebSocketLib.Server;
var mongoose = require('mongoose');
var redis = require('redis');
var fs = require('fs');

// In-house Modules
var chat = require('chatConnect');

// Helpers
var JSONH = require('./app/helpers/JSONHelper');

// Bootstrap db connection
mongoose.connect('mongodb://localhost/test');

// Bootstrap models
var modelsPath = __dirname + '/app/models';
fs.readdirSync(modelsPath).forEach(function (file) {
  require(modelsPath+'/'+file);
}); 

// uncomment to pre-populate with test company and agent
// require('./config/populate').populateDB();

var webSocketServer      = new WebSocketServer({port: 5000, disableHixie: true});
var webSockets            = {};
var webSocketPrimaryKey = -1;

// Create Redis Client
var redisClient = redis.createClient();

webSocketServer.on('connection', function(webSocket) {

  // Add newly created webSocket to webSockets.
  var webSocketId = ++webSocketPrimaryKey;
  webSockets[webSocketId] = webSocket;

  //var redisClient = redis.createClient();
  var redisKey = null;

  // //connect Redis Agent
  // var agent2 = redis.createClient();

  // // Most clients probably don't do much on "subscribe".
  // agent2.on("subscribe", function (channel, count) {
  //     // no output
  // });

  // agent2.on("message", function (channel, message) {
  //   var msg = JSONH.parseJSON(message);
  //   webSocketSend(webSocketId, msg)
  // });

  // agent2.on("ready", function () {
  //     agent2.subscribe("test2");
  // });

  webSocket.on('message', function(message) {
    // Message received from client
    handleMessage(webSocketId, message);
  });

  webSocket.on('close', function() {
    delete webSockets[webSocketId];
  });

});

/**
 * Message received from client
 * Figure out what type of message and handle appropriately
 */

function handleMessage(webSocketId, message) {

  console.log("Request received: "+message);

  var msg = JSONH.parseJSON(message);
  switch (msg.messageType) {
    // Error Case
    case 0:
      return webSocketSend(webSocketId, msg);
    break;

    // Connect Case
    case 1: // eg. { "messageType": 1, "companyKey": 1, "deviceId": 1 }
      initializeConnection(msg, webSocketId);
    break;

    // Incoming Message
    case 2:
      // Validate message
      // Store in MongoDB
      // Validate redisKey (does exist?)
      // reformat JSON received into redis message object
      // Insert into Redis
      redisClient.publish("testRedisKey", JSON.stringify(msg)); // Who is listening?
    break;

    // Add cases here!
  }

}


/**
 * First message from client 
 * Setup/retrieve conversation
 */

function initializeConnection(msg, webSocketId) {

  //Initialize chat connection
  chat.init(msg.companyKey, msg.deviceId, function(err, conversation) {
    if(err) {
      // TODO: Send Error via webSocket to client & return [incorrect company publicKey]
      console.log(err);
      return webSocketSend(webSocketId, {messageType: 0, error: err.message})
    }
    var initResponse = chat.formatInitResponse(conversation);
    webSocketSend(webSocketId, initResponse);
  });

}

/**
 * Send data over websocket having checked connection
 */

function webSocketSend(webSocketId, data) {

  // Check that websocket is still open
    if(webSockets[webSocketId].readyState == WebSocketLib.OPEN) {
      webSockets[webSocketId].send(JSON.stringify(data));
    } 
    // Is this else statement necissary?
    // else {
    //   delete webSockets[webSocketId];
    // }

}
