/**
* Module Dependencies
*/
var xmpp = require('node-xmpp');
var ltx = require('ltx');

// Loading all modules needed
var Logger      = require('./modules/logger');
var Version     = require('./modules/version'); 
var Presence    = require('./modules/presence');
var Roster      = require('./modules/roster');
var DiscoInfo   = require('./modules/disco_info');
var Ping        = require('./modules/ping');
var Message        = require('./modules/message');

// Run function for XMPP Server
exports.run = function(config, mongoose, JSONH, relay) {
    
    // Creates the server.
    var server = new xmpp.C2SServer(config);
    
    // Configure the mods at the server level
    Logger.configure(server, config.logger);
    Version.configure(server, config.version);
    Presence.configure(server, relay);
    Roster.configure(server, config, relay, mongoose);
    DiscoInfo.configure(server);
    Ping.configure(server);
    Message.configure(server, relay);

    // On Connect event. When a client connects.
    server.on("connect", function(client) {

        // Listen for authentication request
        client.on("authenticate", function(opts, cb) {
            var username = opts.user;
            client.username = opts.user;
            var unencrypted_password = opts.password;
            //console.log("Starting Authentication for: " + username + " -> " +unencrypted_password); 
            // Authenticate the agent against db
            var Agent = mongoose.model('Agent');
            Agent.auth(username, unencrypted_password, function(result) {
                if ( result instanceof Error ) {
                    console.log("Error logging in agent");
                    return cb(result);
                } else {
                    relay.agentStatus(opts.user, 'online');
                    client.mongoId = result;
                    return cb();
                }
            });
        });

        // Listen for messages from customer and send to agent
        relay.on('customerMessage', function(msg) {
            var message = msg.message;
            // Check that this message is for the right agent
            if(msg.agent == client.jid.user) {
                var message = new xmpp.Message({ type: 'chat', from: msg.customerId+'@'+config.domain, to: client.jid.bare().toString() }).c('body').t(message.content);
                client.send(message);
            }
        });

        // Listen for customer status updates and send to agent
        relay.on('customerStatus', function(msg) {
            // Check to make sure notification for correct agent
            if(msg.agent == client.jid.user) {
                //console.log("Customer "+customerId+" online: "+status);
                var stanza = ltx.parse('<presence xmlns:stream="http://etherx.jabber.org/streams" from="'+msg.customerId+'@'+config.domain+'" xmlns="jabber:client"><show>chat</show></presence>');
                if(msg.status == 'online') {
                    stanza.c('show').t('chat');
                } else {
                    stanza.c('show').t('away');
                }
                stanza.attrs.to = client.jid.bare().toString();
                // Send notification to agent
                client.send(stanza);
            }
        });

        // Disallow clients to register from XMPP client interface
        client.on("register", function(opts, cb) {
            cb(new Error('Registration disabled for this server')); //always return false
        });

        // Client has logged off
        client.on("close", function() {
            // Mark agent as unavailable
            //console.log("Agent has logged off client");
            relay.agentStatus(client.username, 'offline');
            // Remove all listeners for this agent
            relay.removeAllListeners('customerStatus');
            relay.removeAllListeners('customerMessage');
        });
    });

    // On Disconnect event. When server disconnects
    server.on("close", function(client) {
        console.log("Server has disconneted");
    });

}
