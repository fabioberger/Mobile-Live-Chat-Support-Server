/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var _ = require('underscore');

/**
 * Agent Schema
 */

var AgentSchema = new Schema({
  name: String,
  available: Boolean,
  username: String,
  hashed_password: String,
  salt: String,
  currentConversations: [{ type: Schema.Types.ObjectId, ref: 'Conversation' }]
});

/**
 * Virtuals
 */

AgentSchema
  .virtual('password')
  .set(function(password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function() { return this._password })

/**
 * Validations
 */

var validatePresenceOf = function (value) {
  return value && value.length;
}

AgentSchema.path('name').validate(function (name) {
  return name.length;
}, 'Name cannot be blank');

AgentSchema.path('username').validate(function (username) {
  return username.length;
}, 'Username cannot be blank');

AgentSchema.path('hashed_password').validate(function (hashed_password) {
  return hashed_password.length;
}, 'Password cannot be blank');

/**
 * Pre-save hook
 */

// NO HOOKS YET

/**
 * Methods
 */

AgentSchema.methods = {

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + ''
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  encryptPassword: function (password) {
    if (!password) return ''
    var encrypred
    try {
      encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex')
      return encrypred
    } catch (err) {
      return ''
    }
  }

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