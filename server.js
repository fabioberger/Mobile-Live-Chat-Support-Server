/**
* Module Dependencies
*/
var WebSocketLib = require('ws');
var WebSocketServer = WebSocketLib.Server;
var fs = require('fs');
var dbName = (process.argv[3] != undefined) ? process.argv[3] : 'test';
var mongoose = require('mongoose').connect('mongodb://localhost/'+dbName);
//console.log("Connected to "+dbName+" Database");

// Bootstrap mongoose models
var modelsPath = __dirname + '/app/models';
fs.readdirSync(modelsPath).forEach(function (file) {
  require(modelsPath+'/'+file);
}); 

// Libraries
var chat = require('./app/libs/chatConnect');
var relay = require('./app/libs/chatRelay');

// Helpers
var JSONH = require('./app/helpers/JSONHelper');

/**
* Start XMPP Server
*/
var xmppConfig = require('./config/xmppConfig.js');
var xmppServer = require('./xmpp_server/xmppServer.js');
xmppServer.run(xmppConfig, mongoose, JSONH, relay);

// Uncomment to remove all entries in DB to start tests with clean slate
// require('./config/depopulate').depopulateDB();

// uncomment to pre-populate with test company and agent
// require('./config/populate').populateDB();

var webSocketServer = new WebSocketServer({port: 5000, disableHixie: true});
var webSockets = {};
var webSocketPrimaryKey = -1;

webSocketServer.on('connection', function(webSocket) {

  // Add newly created webSocket to webSockets.
  var webSocketId = ++webSocketPrimaryKey;
  webSockets[webSocketId] = { 'websocket': webSocket};

  webSocket.on('message', function(message) {
    // Message received from client
    handleMessage(webSocketId, message);
  });

  // Listen for messages from agents
  relay.on('agentMessage', function(msg) {
    // Make sure websocket hasnt expired
    if(webSockets[webSocketId]['websocket'] != undefined) {
      // Check to see if msg for correct client
      if(msg.message.customerId == webSockets[webSocketId]['customerId']) {
        delete msg.message.customerId;
        webSocketSend(webSocketId, msg);
      }
    }
  });

  // Listen for status change of connected agent
  relay.on('agentStatus', function(msg) {
    // Make sure websocket hasnt expired
    if(webSockets[webSocketId]['websocket'] != undefined) {
      // Check to see if msg for correct client
      if(msg.agent == webSockets[webSocketId]['agentUsername']) {
        webSocketSend(webSocketId, msg);
      }
    }
  });

  webSocket.on('close', function() {
    relay.customerStatus(webSockets[webSocketId]['agentUsername'], webSockets[webSocketId]['customerId'], 'offline');
    // Remove all listeners before deleting websocket
    relay.removeAllListeners('agentMessage');
    relay.removeAllListeners('agentStatus');
    delete webSockets[webSocketId]['websocket'];
  });

});

/**
 * Message received from client
 * Figure out what type of message and handle appropriately
 */

function handleMessage(webSocketId, message) {

  var msg = JSONH.parseJSON(message);

  // Before anything, lets validate the message
  var validation = JSONH.validateJSON(msg.messageType, msg);
  if(validation instanceof Error ) {
    return webSocketSend(webSocketId, {messageType: 99, request: msg.messageType, error: validation.message});
  }

  console.log("Request received & valid: "+message);

  switch (msg.messageType) {

    // Confirm receipt Case
    case 0:
      console.log("Client confirmed receipt of messageType: "+msg.request);
    break;

    // Connect Case
    case 1: // eg. { "messageType": 1, "companyKey": 1, "deviceId": 1 }
      initializeConnection(msg, webSocketId);
    break;

    // Incoming Message
    case 2:
      // Store in MongoDB
      // reformat JSON received into larger message object
      if(webSockets[webSocketId]['agentUsername']) {
        msg['agentUsername'] = webSockets[webSocketId]['agentUsername'];
        msg['agentId'] = webSockets[webSocketId]['agentId'];
        msg['customerId'] = webSockets[webSocketId]['customerId'];
        relay.customerMessage(msg);
        webSocketSend(webSocketId, {messageType: 4, request: 2});
      } else {
        webSocketSend(webSocketId, {messageType: 99, request: 2, error: 'No initialized connection found'});
      }
    break;

    // Client Errors
    case 4:
      console.log("Received Error Message: "+msg.error);
      webSocketSend(webSocketId, {messageType: 4, request: 4});
    break

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
      return webSocketSend(webSocketId, {messageType: 4, request: 1, error: err.message});
    }
    var initResponse = chat.formatInitResponse(conversation);
    // Send initial response back to client
    webSocketSend(webSocketId, initResponse);
    // Record agent
    webSockets[webSocketId]['customerId'] = conversation.customer;
    webSockets[webSocketId]['agentUsername'] = conversation.agent.username;
    webSockets[webSocketId]['agentId'] = conversation.agent._id;
    relay.customerStatus(conversation.agent.username, conversation.customer, 'online');
  });

}

/**
 * Send data over websocket having checked connection
 */

function webSocketSend(webSocketId, data) {

  // Check that websocket is still open
    if(webSockets[webSocketId]['websocket'].readyState == WebSocketLib.OPEN) {
      webSockets[webSocketId]['websocket'].send(JSON.stringify(data));
    } 
    else {
      console.log("Websocket connection is unexpectedly closed");
      //delete webSockets[webSocketId];
    }

}

// Run Server Tests
// if(dbName == 'auto-test') {
//   require('./tests/mobile_protocol').runTests(webSocketServer);
// }
