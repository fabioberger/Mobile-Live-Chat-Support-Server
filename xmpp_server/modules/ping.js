var xmpp = require('node-xmpp');
var ltx = require('ltx');

// XEP-0199: XMPP Ping
// http://xmpp.org/extensions/xep-0199.html
// Simply replied to pings from an XMPP client with pong (checks if server still connected)

function Ping() {
}

exports.configure = function(server) {
    server.on('connect', function(client) {
        client.on('stanza', function(stz) {
            if (stz.is('iq') && stz.attrs.type === "get" && (stz.getChild('ping', "urn:xmpp:ping"))) {
                var pong = new ltx.Element('iq', {from: stz.attrs.to, to: stz.attrs.from, id: stz.attrs.id, type: 'result'});
                client.send(pong);
            }
        });
    });
}

