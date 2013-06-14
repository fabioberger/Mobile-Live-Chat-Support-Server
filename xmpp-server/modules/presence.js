var xmpp = require('node-xmpp');
var ltx = require('ltx');

// http://xmpp.org/extensions/xep-0160.html
// Implements basic presence (notifies customer when agent goes online/away)

function Presence() {
    
}

exports.configure = function(server, relay) {

    server.on("connect", function(client) {

        client.initial_presence_sent = false;

        client.on('stanza', function(stz) {
            var stanza = ltx.parse(stz.toString());
            if (stanza.is('presence')) {
                if(stanza.getChild('show') == null) {
                    //console.log("Agent back online");
                    relay.agentStatus(client.jid.user, 'online');
                }
                else if(stanza.getChild('show').getText() === "away") {
                    //console.log("Agent went away");
                    relay.agentStatus(client.jid.user, 'offline');
                }
            }
        });

    });
}