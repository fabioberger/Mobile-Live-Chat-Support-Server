/**
* Module Dependencies
*/

var xmpp        = require('node-xmpp');
var mongoose    = require('mongoose');

// Load Mongoose 
var Agent = mongoose.model('Agent');

// Helpers
var JSONH = require('../../app/helpers/JSONHelper');

// In-House Modules
var relay = require('../../app/libs/chatRelay');

// Loading all modules needed
var Logger      = require('../modules/logger');
var Router      = require('../modules/router');
var Offline     = require('../modules/offline');
var Version     = require('../modules/version'); 
var Presence    = require('../modules/presence');
var Roster      = require('../modules/roster');
var DiscoInfo   = require('../modules/disco_info');
var VCard       = require('../modules/vcard');
var Websocket   = require('../modules/websocket');
var S2S         = require('../modules/s2s');
var Ping        = require('../modules/ping');
var Message        = require('../modules/message');

// Loading non -xmpp libraries
var User = require('../lib/users.js').User;

var config = require('../config.js');

// exports.run = function(config, ready) {
    
    // Creates the server.
    var server = new xmpp.C2SServer(config);
    
    // Configure the mods at the server level!
    Router.configure(server, config.router); 
    Logger.configure(server, config.logger);
    Offline.configure(server, config.offline);
    Version.configure(server, config.version);
    Presence.configure(server, config.presence);
    Roster.configure(server, config);
    DiscoInfo.configure(server, config.disco);
    VCard.configure(server, config.vcard);
    Websocket.configure(server, config.websocket);
    S2S.configure(server, config);
    Ping.configure(server, config.ping);
    Message.configure(server, config.message)

    // On Connect event. When a client connects.
    server.on("connect", function(client) {
        client.on("authenticate", function(opts, cb) {
            client.username = opts.user;
            var username = opts.user;
            var unencrypted_password = opts.password;
            //console.log("Starting Authentication for: " + username + " -> " +unencrypted_password); 
            // Authenticate the agent against db
            Agent.auth(username, unencrypted_password, function(result) {
                if ( result instanceof Error ) {
                    console.log("Error logging in agent");
                    return cb(result);
                } else {
                    relay.agentStatus(client.username, true);
                    client.mongoId = result;
                    return cb();
                }
            });
        });

        // On recieving msg from client, send to agent via XMPP
        relay.on('clientMessage', function(message) {
            var msg = JSONH.parseJSON(message);
            // Check that this message is for the right agent
            if(msg.agent == client.username) {
                var message = new xmpp.Message({ type: 'chat', from: msg.customerId+'@'+config.domain, to: client.jid.bare().toString() }).c('body').t(msg.content);
                client.send(message);
            }
        });

        // Disallow clients to register from XMPP client interface
        client.on("register", function(opts, cb) {
            cb(false); //always return false
        });

        client.on("stanza", function(stanza) {
            //console.log("intercept: "+stanza);
        });

        // Client has logged off
        client.on("close", function() {
            // Mark agent as unavailable
            //console.log("Agent has logged off client");
            relay.agentStatus(client.username, false);
        });
    });

    // On Disconnect event. When server disconnects
    server.on("close", function(client) {
        console.log("Server has disconneted");
    });

    // This is a callback to trigger when the server is ready. That's very useful when running a server in some other code.
    // We may want to make sure this is the right place for it in the future as C2S and S2S may not be abll ready.
//     ready();
// }
