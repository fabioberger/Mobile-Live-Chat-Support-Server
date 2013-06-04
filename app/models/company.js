/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');

/**
 * Company Schema
 */

var CompanySchema = new Schema({
  name: String,
  key: String,
  agents: [{ type: Schema.Types.ObjectId, ref: 'Agent' }]
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

CompanySchema.path('name').validate(function (name) {
  return name.length;
}, 'Name cannot be blank');

/**
 * Pre-save hook
 */

// NO HOOKS YET

/**
 * Methods
 */

CompanySchema.methods = {

  /**
  * Assign Company Agent to Customer
  */
  assignAgent: function(customer) {
    
  }

}

CompanySchema.statics = {

  /**
   * Find company by key
   *
   * @param {String} key
   * @param {Function} cb
   * @api private
   */

  load: function (key, cb) {
    this.findOne({ key : key })
      .populate('agents') //TODO: specify only agent metadata you want
      .exec(cb);
  }

}

mongoose.model('Company', CompanySchema);