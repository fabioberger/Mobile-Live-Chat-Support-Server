var xmpp = require('node-xmpp');
var ltx = require('ltx');

// http://xmpp.org/rfcs/rfc3921.html#roster
// Returns roster of all agents current conversation contacts
/* Items have : 
- key(jid)
- state
- name
*/

function Roster() {
}

exports.configure = function(server, config, relay, mongoose) {

    server.on("connect", function(client) {

        client.on('stanza', function(stz) {
            var self = this;
            var stanza = ltx.parse(stz.toString());
            var query = null;
            // Check if stanza request is for an agents roster
            if (stanza.is('iq') && (query = stanza.getChild('query', "jabber:iq:roster"))) {

                // If they want to get roster, find it in MongoDB
                if(stanza.attrs.type === "get") {
                    getRoster(stanza, client, query);
                }
            }
        });
    });

    // Get all roster items from mongodb
    function getRoster(stanza, client, query) {

        stanza.attrs.type = "result";

        var Conversation = mongoose.model('Conversation');
        Conversation.loadConversationsByAgent(client.mongoId, function(err, conversations) {
            if(err) {
                console.log(err);
            }
            conversations.forEach(function(convo) {
                // Attach all roster items to query object
                query.c("item", {approved: true, jid: convo.customer._id+'@'+config.domain, name: convo.customer._id+'', subscription: 'both'});
                // Make the customer also re-appear as online
                relay.customerStatus(client.jid.user, convo.customer._id, 'online');
            });
            stanza.attrs.to = stanza.attrs.from;
            client.send(stanza);
        });

    }
} 