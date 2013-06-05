/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');

/**
 * Message Schema
 */

var MessageSchema = new Schema({
  author: String,
  timestamp: String,
  content: String
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

MessageSchema.path('author').validate(function (author) {
  return author.length;
}, 'Author cannot be blank');

MessageSchema.path('timestamp').validate(function (timestamp) {
  return timestamp;
}, 'timestamp cannot be blank');

/**
 * Pre-save hook
 */

// NO HOOKS YET

/**
 * Methods
 */

MessageSchema.methods = {

  // No METHODS YET

}

MessageSchema.statics = {

  // NO STATICS YET

}

mongoose.model('Message', MessageSchema);