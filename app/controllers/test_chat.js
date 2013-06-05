
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

function init(companyKey, deviceId, next) {


    // Begin Control Flow
    async.waterfall([
      function(callback) {
        var Company = mongoose.model('Company');
        Company.load(companyKey, function(err, company) {
          if(err) { 
            return callback(err);  
          }
          if(company == null) { 
            return callback(new Error("Incorrect company public key."));
          }
          callback(null, company, deviceId);
        });
      },
      checkRelationship,
      checkConversation,
      //reconnect
    ], function (err, result) {
       // Do something at the end!   
       if(err) {
        return next(err);
       }
       console.log(result);
       next(result);
    });

}

/**
* Check if company publicKey is valid
*/
// function checkPublicKey(companyKey, callback) {

//   var Company = mongoose.model('Company');
//   Company.load(companyKey, function(err, company) {
//     if(err) { console.log(err); }
//     if(company == null) { 
//       callback(new Error("Incorrect company public key."));
//       return;
//     }
//     callback(null, company);
//   });

// }

/**
* Check if customer<->company relationship already established
*/
function checkRelationship(company, deviceId, callback) {

  // Begin Control Flow
  async.waterfall([
    function(cb) {

      var Customer = mongoose.model('Customer');
      Customer.findOne({deviceId: deviceId, company: company._id}, function(err, customer) {
        if(err) { 
          return callback(err); 
        }
        if(customer == null) { 
          console.log('No customer with supplied deviceId found for this company'); 
          return cb(null, deviceId, company);
        } else {
          //Customer already exists so continue with init
          callback(null, customer, company);
        }
      });
    },
    setupCustomer,
    assignAgent,
    createConversation
  ], function (err, result) {
      if(err) {
        return callback(err);
      }
      callback(null, result);   
  });

}

/**
* Make sure customer already exists in system
*/
// function checkCustomer(cb) {

//   var Customer = mongoose.model('Customer');
//   Customer.findOne({deviceId: deviceId, company: company._id}, function(err, customer) {
//     if(err) { console.log(err); }
//     if(customer == null) { 
//       console.log('No customer with supplied deviceId found for this company'); 
//       cb(null);
//     }
//     //Customer already exists so continue with init
//     callback(null, customer, company);
//     return;
//   });

// }

/**
* Setup a new customer in the system
*/
function setupCustomer(deviceId, company, cb) {

  // Create new customer
  var Customer = mongoose.model('Customer');
  Customer.create({deviceId : deviceId, company: company._id}, function(err, customer) {
    if(err) { 
      return cb(err); 
    }
    cb(null, company.agents, customer);
  });

}

/**
* Assign an available agent
*/
function assignAgent(agents, customer, cb) {
  // Over simplified for now
  // TODO: Find the agent who is available and who is currently helping the least
  //       number of customers. Alternative: Add to a list and let agents pick them
  var agent = _.findWhere(agents, {available : true});
  if(_.isUndefined(agent)) {
    return cb(new Error("Company has no online agents"));
  }
  cb(null, agent, customer);
}

/**
* Create a new conversation
*/
function createConversation(agent, customer, cb) {

  var Message = mongoose.model('Message');
  Message.create({author: "agent", timestamp : Date.now(), content: "Hi, how may I help you?"}, function(err, message) {
    if(err) { 
      return cb(err); 
    }

    var redisKey = 1;

    var Conversation = mongoose.model('Conversation');
    Conversation.create({agent : agent._id, customer : customer._id, redisKey : redisKey, messages : message }
    ,function(err, conversation) {
      if(err) { 
        return cb(err); 
      }
      cb(null, conversation);
    })
  });

}

/**
* Check for an existing conversation between customer and company agent
*/
function checkConversation(customer, company, callback) {

  var Conversation = mongoose.model('Conversation');
  Conversation.load(customer._id, company._id, function(err, conversation) {
    if(err) { 
      return callback(err); 
    }
    if(conversation == null) {
      // TODO: Create a new conversation, assign agent & return welcome JSON
      return callback(null, "no conversation");
    }
    callback(null, conversation, company.name);
  });

}

/**
 * Chat Singleton Class
 */

var Chat = {
  init : init,
  checkRelationship : checkRelationship,
  setupCustomer : setupCustomer,
  assignAgent : assignAgent
};

module.exports = Chat;


// /**
// * Re-connect Agent & start chat
// */
// function reconnect(conversation, companyName, callback) {

//   // TODO: Conversation does exist, re-connect Agent & start chat
//   // Pull existing conversation from Redis and return as JSON
//   next(null, "reconnect");
//   callback(null, 'done');

// }


//   // OLD CODE
//   // redis_client.llen('messages', function(error, messages_length) {
//   //   if (error) throw error;
//   //   var new_messages_length = messages_length - message_array[1];
//   //   if (new_messages_length) {
//   //     redis_client.lrange('messages', -Math.min(50, new_messages_length), -1, function(error2, newest_messages) {
//   //       if (error2) throw error2;
//   //       if (newest_messages) {
//   //         web_socket.send(JSON.stringify([0, messages_length, newest_messages.map(JSON.parse)]));
//   //       }
//   //     });
//   //   } else {
//   //     web_socket.send('[0]');
//   //   }
//   // });

