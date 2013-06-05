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
  redisKey: String,
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
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

  // No METHODS YET

}

ConversationSchema.statics = {

  /**
   * Find Conversation by id
   *
   * @param {_id} id
   * @param {Function} cb
   * @api private
   */

  load: function (customerId, companyId, cb) {
    this.findOne({ customer : customerId, company : companyId })
      .populate('agent') //TODO: specify only agent metadata you want
      .populate('messages') //TODO: specify only messages metadata you want
      .exec(cb);
  }

}

mongoose.model('Conversation', ConversationSchema);