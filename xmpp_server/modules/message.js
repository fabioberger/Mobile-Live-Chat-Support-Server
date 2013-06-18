var xmpp = require('node-xmpp');
var ltx = require('ltx');

// Message handling

function Message() {
}

exports.configure = function(server, relay) {
    server.on('connect', function(client) {
        client.on('stanza', function(stz) {

            // Parse stanza and check that it is of type message
            var stanza = ltx.parse(stz.toString());
            if (stanza.is('message') && stanza.attrs.type !== 'error') {

                var agentUsername = stanza.attrs.from.split("@")[0]; //isolate username
                var customerId = stanza.attrs.to.split("@")[0]; // isolate customerId

                // If message has body, send it to the customer
                if(stanza.getChild('body') !== undefined) {
                    var content = stanza.getChildText('body');
                    relay.agentMessage(customerId, client.mongoId, content);
                } else if(stanza.getChild('composing') !== undefined) {
                    // Notify customer that agent is typing
                    //console.log('Agent is typing');
                    relay.agentStatus(agentUsername, 'composing');
                } else if(stanza.getChild('paused') !== undefined) {
                    // Notify customer that agent has paused
                    //console.log('Agent is paused');
                    relay.agentStatus(agentUsername, 'paused');
                }
            }
        });
    });
}
