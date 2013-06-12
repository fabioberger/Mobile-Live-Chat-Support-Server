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
   */

  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('currentConversations') //TODO: specify only conversation metadata you want
      .exec(cb);
  },


  /**
   * Authenticate Agent by username & password
   *
   * @param {username} username
   * @param {unencrypted_password} unencrypted_password
   * @param {Function} cb
   */

  auth: function(username, unencrypted_password, cb) {
    this.findOne({username: username}, function(err, agent) {
        if(err) {
            console.log(err);
            return cb(new Error("Authentication failure"));
        }
        if(agent == null) {
            console.log("Agent with username not found");
            return cb(new Error("Authentication failure"));
        }
        if(agent.authenticate(unencrypted_password)) {
            //console.log("Agent has successfully authenticated");
            return cb(agent._id);
        }
    });
  },

   /**
   * Change Agents Availablity
   *
   * @param {username} username
   * @param {available} available
   * @param {Function} cb
   */

   availability: function(username, status) {
    this.update({username: username}, { $set: { available: status } }, function(err, numAffected) {
        if(err) {
            console.log(err);
            return err;
        }
        return true;
    });
  },

}

mongoose.model('Agent', AgentSchema);