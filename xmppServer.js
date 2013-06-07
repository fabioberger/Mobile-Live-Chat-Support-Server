/**
* Module Dependencies
*/

var xmpp = require('node-xmpp');
var ltx = require('ltx');
var mongoose = require('mongoose');

/**
* Model Dependencies
*/
require(__dirname + '/app/models/agent.js');

// Bootstrap db connection
mongoose.connect('mongodb://localhost/test');

/* This is a very basic C2S server example. One of the key design decisions of node-xmpp is to keep it very lightweight */
/* If you need a full blown server check out https://github.com/superfeedr/xmpp-server */

// Sets up the server.
var c2s = new xmpp.C2SServer({
    port: 5222,
    domain: 'localhost'//,
    // tls: {
    //     keyPath: './examples/localhost-key.pem',
    //     certPath: './examples/localhost-cert.pem'
    // }

});

// On Connect event. When a client connects.
c2s.on("connect", function(client) {
    // That's the way you add mods to a given server.

    // Allows the developer to register the jid against anything they want
    c2s.on("register", function(opts, cb) {
    	console.log("REGISTER");
	cb(true);
    });

    // Allows the developer to authenticate users against anything they want.
    client.on("authenticate", function(opts, cb) {
        var username = opts.user;
        var unencrypted_password = opts.password;
    	//console.log("Starting Authentication for: " + username + " -> " +unencrypted_password); 
        var Agent = mongoose.model('Agent');
        Agent.findOne({username: username}, function(err, agent) {
            if(err) {
                console.log(err);
                return cb(false);
            }
            if(agent == null) {
                console.log("Agent with username not found");
                return cb(false);
            }
            if(agent.authenticate(unencrypted_password)) {
                console.log("Agent has successfully authenticated");
                return cb(null);
            }
        });
    });
    
    client.on("online", function() {
    	console.log("ONLINE");
    	client.send(new xmpp.Message({ type: 'chat' }).c('body').t("Hello there, little client."));
    });

    // Stanza handling
    // client.on("stanza", function(stanza) {
    // 	console.log("STANZA" + stanza);
    // });

    client.on('stanza', function(stz) {
        console.log("Stanza: "+stz);
            var query = null;
            var stanza = ltx.parse(stz.toString());
            if (stanza.is('iq') && (query = stanza.getChild('query', "http://jabber.org/protocol/disco#info"))) {
                stanza.attrs.type = "error";
                stanza.attrs.to = stanza.attrs.from;
                delete stanza.attrs.from;
                client.send(stanza);
            } else if (stanza.is('iq') && (query = stanza.getChild('query', "http://jabber.org/protocol/disco#items"))) {
                stanza.attrs.type = "error";
                stanza.attrs.to = stanza.attrs.from;
                delete stanza.attrs.from;
                client.send(stanza);
            }
        });

    // On Disconnect event. When a client disconnects
    client.on("disconnect", function(client) {
    	console.log("DISCONNECT");
    });

});