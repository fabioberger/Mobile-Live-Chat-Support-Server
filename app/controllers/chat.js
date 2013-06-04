
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var redis_client = require('redis').createClient();
var async = require('async');
var _ = require('underscore');

/**
 * Initialize chat when app connects/reconnects
 */
exports.init = function(companyKey, deviceId, next) {

  // Begin Control Flow
  async.waterfall([
    checkPublicKey,
    checkRelationship,
    checkConversation,
    reconnect
], function (err, result) {
   // result now equals 'done'    
});

/**
* Check if company publicKey is valid
*/
function checkPublicKey(callback) {

  var Company = mongoose.model('Company');
        Company.load(companyKey, function(err, company) {
          if(err) { console.log(err); }
          if(company == null) { 
            next(new Error("Incorrect company public key."));
            return;
          }
          callback(null, company);
        });

}

/**
* Check if customer<->company relationship already established
*/
function checkRelationship(company, callback) {

  var Customer = mongoose.model('Customer');
        Customer.findOne({deviceId: deviceId, company: company._id}, function(err, customer) {
          if(err) { console.log(err); }
          if(customer == null) { 
            console.log('No customer with supplied deviceId found for this company'); 
            next(null, "no customer");
            // Create new customer
            // Customer.createWithDeviceId(deviceId, company._id, function(customer) {
            //   Company.assignAgent(customer, function(agent) {

            //   });
            // });
            // TODO: Create Customer, assign to Agent & return wecome JSON
            return;
          }
          callback(null, customer, company);
        });

}

/**
* Check for an existing conversation between customer and company agent
*/
function checkConversation(customer, company, callback) {

  var Conversation = mongoose.model('Conversation');
        Conversation.load(customer._id, company._id, function(err, conversation) {
          if(err) { console.log(err); }
          if(conversation == null) {
            // TODO: Create a new conversation, assign agent & return welcome JSON
            next(null, "no conversation");
          }
          callback(null, conversation, company.name);
        });

}

/**
* Re-connect Agent & start chat
*/
function reconnect(conversation, companyName, callback) {

  // TODO: Conversation does exist, re-connect Agent & start chat
  // Pull existing conversation from Redis and return as JSON
  next(null, "reconnect");
  callback(null, 'done');

}


  // OLD CODE
  // redis_client.llen('messages', function(error, messages_length) {
  //   if (error) throw error;
  //   var new_messages_length = messages_length - message_array[1];
  //   if (new_messages_length) {
  //     redis_client.lrange('messages', -Math.min(50, new_messages_length), -1, function(error2, newest_messages) {
  //       if (error2) throw error2;
  //       if (newest_messages) {
  //         web_socket.send(JSON.stringify([0, messages_length, newest_messages.map(JSON.parse)]));
  //       }
  //     });
  //   } else {
  //     web_socket.send('[0]');
  //   }
  // });
};