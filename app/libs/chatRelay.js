/**
 * Module dependencies.
 */

var EventEmitter = require("events").EventEmitter;
var mongoose    = require('mongoose');
var fs = require('fs');

// Bootstrap models
var modelsPath = __dirname + '/../models';
fs.readdirSync(modelsPath).forEach(function (file) {
  require(modelsPath+'/'+file);
}); 

// Load Mongoose 
var Agent = mongoose.model('Agent');

// Helpers
var JSONH = require('../helpers/JSONHelper');


function Relay() {
  EventEmitter.call(this);
}

Relay.prototype.__proto__ = EventEmitter.prototype;

/**
 * Methods
 */

/**
 * Receive Client Message and re-broadcast
 */

Relay.prototype.clientMessage = function(message) {
	this.emit('clientMessage', message);
}

/**
 * Receive Agent Message and re-broadcast
 */

Relay.prototype.agentMessage = function(message) {
	var msg = JSONH.parseJSON(message);
	msg['author'] = 'agent';
    delete msg.agent;
    var response = { messageType: 2, message: msg }
	this.emit('agentMessage', response);
}

/**
 * Agent Status Change
 */

Relay.prototype.agentStatus = function(username, status) {
	Agent.availability(username, status);
	this.emit('agentStatus', username, status);
}


/**
 * chatRelay Object class
 */

 exports = module.exports = new Relay();
