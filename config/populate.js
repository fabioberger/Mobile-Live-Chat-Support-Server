
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');

exports.populateDB = function() {

  // Create Agent
  var Agent = mongoose.model('Agent');
  Agent.findOne({name: "Tom"}, function(err, agent) {
      if(err) { 
        return callback(err); 
      }
      if(agent == null) { 
        Agent.create({ "name" : "Tom", "available" : true}, function(err, agent) {
		    if(err) { 
		      return callback(err); 
		    }
		    
		    // Create new Company
			var Company = mongoose.model('Company');
			Company.create({ "name" : "ShoeBoxed", "key" : "1", "agents" : [agent._id] }, function(err, company) {
			  if(err) { 
			    return callback(err); 
			  }
			  console.log("Demo Company Created"+company);

			});

		  });
      } else {
        //Already created
        console.log("Demo Company already created");
      }
    });


}