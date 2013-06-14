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

Relay.prototype.customerMessage = function(msg) {
	this.emit('customerMessage', msg);
}

/**
 * Receive Agent Message and re-broadcast
 */

Relay.prototype.agentMessage = function(customerId, content) {
	var timestamp = parseInt(new Date().getTime());
	var msg = {
		author: 'agent',
		customerId: customerId,
		timestamp: timestamp,
		content: content
	}
    var response = { messageType: 2, message: msg }
	this.emit('agentMessage', response);
}

/**
 * Agent Status Change
 * supported status notifications: 'online', 'offline', 'composing', 'paused'
 */

Relay.prototype.agentStatus = function(username, status) {
	Agent.availability(username, status);
	var msg = {
		messageType: 3,
		agent: username,
		status: status
	}
	this.emit('agentStatus', msg);
}

/**
 * Customer Status Change
 * supported status notifications: 'online', 'offline'
 */

Relay.prototype.customerStatus = function(username, customerId, status) {
	var msg = {
		agent: username,
		customerId: customerId,
		status: status
	}
	this.emit('customerStatus', msg);
}


/**
 * chatRelay Object class
 */

 exports = module.exports = new Relay();
