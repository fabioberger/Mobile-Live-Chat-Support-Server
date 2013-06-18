/**
 * Module dependencies.
 */

var EventEmitter = require("events").EventEmitter;
var mongoose    = require('mongoose');

// Load Mongoose Schemas
var Agent = mongoose.model('Agent');
var Conversation = mongoose.model('Conversation');
var Message = mongoose.model('Message');

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
    saveMessage(msg.customerId, msg.agentId, msg.message);
	this.emit('customerMessage', msg);
}

/**
 * Save Messages to DB & add to correct conversation
 */

function saveMessage(customerId, agentId, message) {

	var customerId = mongoose.Types.ObjectId(customerId+'');
    var agentId = mongoose.Types.ObjectId(agentId+'');

	Message.create(message, function(err, message) {
	    if(err) {
	    	return console.log(err);
	    }
		Conversation.update({ customer : customerId, agent: agentId, archived: false }, {$push: { messages: message}}, function(err, conversation) {
	    	if(err) {
	    		return console.log(err);
	    	}
	    }); 
	});

	return true;

}

/**
 * Archive a given conversation when agent ends it
 */

function archiveConversation(customerId, agentId) {

	var customerId = mongoose.Types.ObjectId(customerId+'');
    var agentId = mongoose.Types.ObjectId(agentId+'');

	Conversation.update({ customer : customerId, agent: agentId }, {$set: { archived: true}}, function(err, conversation) {
    	if(err) {
    		return console.log(err);
    	}
    }); 

	return true;

}

/**
 * Receive Agent Message and re-broadcast
 */

Relay.prototype.agentMessage = function(customerId, agentId, content) {
	if(content == '$end') {
		return archiveConversation(customerId, agentId);
	}
	var timestamp = parseInt(new Date().getTime());
	var msg = {
		author: 'agent',
		customerId: customerId,
		timestamp: timestamp,
		content: content
	}
	saveMessage(customerId, agentId, msg);
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
