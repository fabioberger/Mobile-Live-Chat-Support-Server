/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');

/**
 * Conversation Schema
 */

var ConversationSchema = new Schema({
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  agent: { type: Schema.Types.ObjectId, ref: 'Agent' },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  timestamp: String,
  archived: Boolean
});

/**
 * Virtuals
 */

// NO VIRTUALS YET

/**
 * Validations
 */

// NO VALIDATIONS YET

/**
 * Pre-save hook
 */

// NO HOOKS YET

/**
 * Methods
 */

ConversationSchema.methods = {

  /**
   * Add message to conversation
   *
   * @param {Object} message
   */

   // addMessage: function(message) {

   //  this.update({})

   // }

}

ConversationSchema.statics = {

  /**
   * Find Conversation by id
   *
   * @param {_id} id
   * @param {Function} cb
   */

  load: function (customerId, companyId, cb) {
    this.findOne({ customer : customerId, company : companyId, archived: false })
      .populate('company', { name : 1, _id : 0 })
      .populate('agent', { name : 1, username: 1, _id : 1})
      .populate('messages', { author : 1, timestamp : 1, content : 1, _id : 0}) 
      .exec(cb);
  },

  /**
   * Load All Conversations for Agent
   *
   * @param {_id} agentId
   * @param {Function} cb
   */

  loadConversationsByAgent: function (agentId, cb) {
    var agentId = mongoose.Types.ObjectId(agentId+'');
    this.find({ agent : agentId, archived: false })
      .populate('customer') 
      .exec(cb);
  }

}

mongoose.model('Conversation', ConversationSchema);