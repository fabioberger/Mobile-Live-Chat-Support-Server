/**
 * Module dependencies.
 */

var mongoose = require('mongoose');


exports.depopulateDB = function() {

// Remove all companies
var Company = mongoose.model('Company');
Company.remove(function(err, num) {
	if(err) {
		console.log(err);
	}
	console.log(num+" Companies deleted");
});

// Remove all agents
var Agent = mongoose.model('Agent');
Agent.remove(function(err, num) {
	if(err) {
		console.log(err);
	}
	console.log(num+" agents deleted");
});

// Remove all customers
var Customer = mongoose.model('Customer');
Customer.remove(function(err, num) {
	if(err) {
		console.log(err);
	}
	console.log(num+" customers deleted");
});

// Remove all conversations
var Conversation = mongoose.model('Conversation');
Conversation.remove(function(err, num) {
	if(err) {
		console.log(err);
	}
	console.log(num+" conversations deleted");
});

// Remove all messages
var Message = mongoose.model('Message');
Message.remove(function(err, num) {
	if(err) {
		console.log(err);
	}
	console.log(num+" messages deleted");
});


}