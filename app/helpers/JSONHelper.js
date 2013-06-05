/**
 * JSONHelper
 */

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