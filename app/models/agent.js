/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');

/**
 * Agent Schema
 */

var AgentSchema = new Schema({
  name: String,
  available: Boolean,
  currentConversations: [{ type: Schema.Types.ObjectId, ref: 'Conversation' }]
});

/**
 * Virtuals
 */

// NO VIRTUALS YET

/**
 * Validations
 */

var validatePresenceOf = function (value) {
  return value && value.length;
}

AgentSchema.path('name').validate(function (name) {
  return name.length;
}, 'Name cannot be blank');

/**
 * Pre-save hook
 */

// NO HOOKS YET

/**
 * Methods
 */

AgentSchema.methods = {

  // No METHODS YET

}

AgentSchema.statics = {

  /**
   * Find Agent by id
   *
   * @param {_id} id
   * @param {Function} cb
   * @api private
   */

  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('currentConversations') //TODO: specify only conversation metadata you want
      .exec(cb);
  }

}

mongoose.model('Agent', AgentSchema);