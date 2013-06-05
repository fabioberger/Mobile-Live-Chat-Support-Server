/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');

/**
 * Customer Schema
 */

var CustomerSchema = new Schema({
  deviceId: String,
  company: { type: Schema.Types.ObjectId, ref: 'Company' }
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

CustomerSchema.path('deviceId').validate(function (deviceId) {
  return deviceId.length;
}, 'DeviceId cannot be blank');

/**
 * Pre-save hook
 */

// NO HOOKS YET

/**
 * Methods
 */

CustomerSchema.methods = {

// No METHODS YET

}

CustomerSchema.statics = {

  /**
   * Find Customer by deviceId
   *
   * @param {deviceId} deviceId
   * @param {Function} cb
   * @api private
   */

  load: function (deviceId, cb) {
    this.findOne({ deviceId : deviceId })
      .populate('company', 'key') //TODO: specify only company metadata you want
      .exec(cb);
  }

  /**
  * Create Customer given deviceId & Company
  *
   * @param {deviceId} deviceId
   * @param {companyId} companyId
  */
  // createWithDeviceId: function(deviceId, companyId, next) {
  //   this.create({deviceId : deviceId, company: companyId}, function(err, customer) {
  //     if(err) {
  //       console.log(err);
  //     }
  //     next(customer);
  //   });
  // }

}

mongoose.model('Customer', CustomerSchema);