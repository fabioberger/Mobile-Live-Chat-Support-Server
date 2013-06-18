/**
 * JSONHelper
 */

/**
* Module Dependencies
*/

var val = require('jsonschema');
var v = new val.Validator();

// Validation schemas
var schemas = require('./../validations/mobile_protocol');

/**
 * Parses JSON into Javascript object
 */

exports.parseJSON = function(message) {
	try {
        return JSON.parse(message);
    }
    catch (e) {
        console.log(e);
        return {messageType: 0, error: e.message};
    }
}

/**
 * Validate a given JSON object
 */

exports.validateJSON = function(messageType, message) {

	errors = [];

	switch (messageType) {

	    // Confirm receipt Case
	    case 0:
	      errors = v.validate(message, schemas.received);
	    break;

	    // Connect Case
	    case 1: 
	      errors = v.validate(message, schemas.init);
	    break;

	    // Incoming Message
	    case 2:
	      errors = v.validate(message, schemas.msg);
	    break;

	    // Client Errors
	    case 4:
	      errors = v.validate(message, schemas.error);
	    break

  	}


	if(errors.length != 0) {
	  return new Error("Validation error: "+errors[0].property+" "+errors[0].message);
	}

	return true;

}