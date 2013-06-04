var mongoose = require('mongoose');
var fs = require('fs');

mongoose.connect('mongodb://localhost/test');

// Bootstrap models
var models_path = __dirname + '/app/models';
fs.readdirSync(models_path).forEach(function (file) {
  require(models_path+'/'+file);
});

var Agent = mongoose.model('Agent');

var timmy = new Agent({name: "Tom", available: true, currentConversations: []});

timmy.save(function (err, timmy) {
  console.log("Timmy saved");
});

var Company = mongoose.model('Company');
var comp = new Company({name: "ShoeBoxed", key: 1, agents: [timmy._id]});

comp.save(function (err, comp) {
  console.log("Company saved");
  console.log(comp);
});



// var objectId = mongoose.Types.ObjectId;
// Agent.load(new objectId("51ad6a8f4ef4f55c76000002"), function(err, agent) {
//   console.log(agent);
// });


// Check if company in DB by  company key
// Company.load(companyKey, function(err, company) {
//           if(err) { console.log(err); }
//           if(company == null) { 
//             console.log('No company with supplied key found'); 
//             // TODO: Send Error via web_socket to client & return
//           }
//           callback(null, company);
//         });