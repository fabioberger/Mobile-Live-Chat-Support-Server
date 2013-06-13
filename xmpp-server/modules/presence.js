var xmpp = require('node-xmpp');
var ltx = require('ltx');

// In-House Modules
var relay = require('../../app/libs/chatRelay');

// http://xmpp.org/extensions/xep-0160.html

// TODO
// Deal with 5.1.4.  Directed Presence. 
// PROBLEM : HOW DO WE INTERRUPT A STANZA?
// IMPLEMENT PRIORITY (IN ROUTER AS WELL!)
// 

function Presence() {
    
}

exports.configure = function(server, config) {
    // server.router.on("recipientOffline", function(stanza) {
    //     if(stanza.is("presence")) {
    //         //console.log("PRESENCE FOR OFFLINE USER!");
    //     }
    // });

    server.on("connect", function(client) {

        client.initial_presence_sent = false;

        client.on('stanza', function(stz) {
            var stanza = ltx.parse(stz.toString());
            if (stanza.is('presence')) {
                if(stanza.getChild('show') == null) {
                    //console.log("Agent back online");
                    relay.agentStatus(client.username, 'online');
                }
                else if(stanza.getChild('show').getText() === "away") {
                    //console.log("Agent is away!");
                    relay.agentStatus(client.username, 'offline');
                }
            }
        });

    });
}