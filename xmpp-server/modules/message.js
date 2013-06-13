var xmpp = require('node-xmpp');
var ltx = require('ltx');

// In-House Modules
var relay = require('../../app/libs/chatRelay');

// Message handling

function Message() {
}

exports.configure = function(server, config) {
    server.on('connect', function(client) {
        client.on('stanza', function(stz) {
            var stanza = ltx.parse(stz.toString());
            if (stanza.is('message') && stanza.attrs.type !== 'error') {
                console.log("Msg stanza "+stanza);
                var agent = stanza.attrs.from.split("@");
                var customer = stanza.attrs.to.split("@");
                if(stanza.getChild('body') !== undefined) {
                    var content = stanza.getChild('body').getText();
                    var timestamp = parseInt(new Date().getTime());
                    msg = {
                        agent: agent[0],
                        customerId: customer[0],
                        content: content,
                        timestamp: timestamp
                    }
                    message = JSON.stringify(msg);
                    console.log('Agent Sends: '+message);
                    relay.agentMessage(message);
                } else {
                    // In future: handle other msg structures: 'composing & paused'
                    // So client knows what agent is doing
                }
            }
        });
    });
}
