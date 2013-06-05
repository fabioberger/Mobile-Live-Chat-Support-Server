
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var redis_client = require('redis').createClient();
var async = require('async');
var _ = require('underscore');

/**
 * Methods
 */

/**
 * Initialize chat when app connects/reconnects
 */

function init(companyKey, deviceId, callback) {

        var Company = mongoose.model('Company');
        Company.load(companyKey, function(err, company) {
          if(err) { 
            return callback(err);  
          }
          if(company == null) { 
            return callback(new Error("Incorrect company public key."));
          }
      
          var Customer = mongoose.model('Customer');
          Customer.findOne({deviceId: deviceId, company: company._id}, function(err, customer) {
            if(err) { 
              return callback(err); 
            }
            if(customer == null) { 
              console.log('No customer with supplied deviceId found for this company'); 
              initCustomer(deviceId, company, callback);
            } else {
              //Customer already exists so continue with init
              getConversation(customer, company, callback);
            }
          });

        });

}

function getConversation(customer, company, callback) {

  var Conversation = mongoose.model('Conversation');
  Conversation.load(customer._id, company._id, function(err, conversation) {
    if(err) { 
      return callback(err); 
    }
    if(conversation == null) {
      // TODO: Create a new conversation, assign agent & return welcome JSON
      assignAgentToConversation(company, customer, callback);
    } else {
      callback(null, conversation, company.name);
    }
  });

}

function initCustomer(deviceId, company, callback) {

  // Create new customer
  var Customer = mongoose.model('Customer');
  Customer.create({deviceId : deviceId, company: company._id}, function(err, customer) {
    if(err) { 
      return callback(err); 
    }
    
  assignAgentToConversation(company, customer, callback);

  });

}


function assignAgentToConversation(company, customer, callback) {

  var agent = _.findWhere(company.agents, {available : true});
  if(_.isUndefined(agent)) {
    return callback(new Error("Company has no online agents"));
  }
  
  createConversationWithWelcome(company, agent, customer, callback);

}

function createConversationWithWelcome(company, agent, customer, callback) {

  //Create welcome message
  var Message = mongoose.model('Message');
  Message.create({author: "agent", timestamp : Date.now(), content: "Hi, how may I help you?"}, function(err, message) {
    if(err) { 
      return callback(err); 
    }

    createConversation(company, agent, customer, message, callback);
  });

}

function createConversation(company, agent, customer, message, callback) {

  var redisKey = 1;

  var Conversation = mongoose.model('Conversation');
  Conversation.create({company : company._id, agent : agent._id, customer : customer._id, redisKey : redisKey, messages : message }
  ,function(err, conversation) {
    if(err) { 
      return callback(err); 
    }
    callback(null, conversation);
  });

}



/**
 * Chat Singleton Class
 */

var Chat = {
  init : init,
};

module.exports = Chat;
