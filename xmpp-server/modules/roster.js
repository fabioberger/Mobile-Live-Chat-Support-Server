var xmpp = require('node-xmpp');
var ltx = require('ltx');

var mongoose    = require('mongoose');

// Load Mongoose 
var Conversation = mongoose.model('Conversation');

// http://xmpp.org/rfcs/rfc3921.html#roster
/* Items have : 
- key(jid)
- state
- name
- groups [Not supported here for now TODO]
*/

function Roster() {
}

exports.configure = function(server, config) {

    server.on("connect", function(client) {

        client.on('auth-success', function(jid) {
            //client.roster.owner = jid.bare().toString();
        });

        client.on('stanza', function(stz) {
            var self = this;
            var stanza = ltx.parse(stz.toString());
            var query = null;
            // Check if request is for roster
            if (stanza.is('iq') && (query = stanza.getChild('query', "jabber:iq:roster"))) {
                //console.log(query);
                // If they want to get roster, find it in REDIS & return it
                if(stanza.attrs.type === "get") {
                    stanza.attrs.type = "result";

                    Conversation.loadConversationsByAgent(client.mongoId, function(err, conversations) {
                        if(err) {
                            console.log(err);
                        }

                        conversations.forEach(function(convo) {
                            // Attach all roster items to query object
                            // Add group to this & Fudge so it seems like all clients are online (sessions)
                            query.c("item", {approved: true, jid: convo.customer._id+'@'+config.domain, name: convo.customer._id+'', subscription: 'both'});
                        });
                        if(client.username != 'bobby') {
                            query.c("item", {approved: true, jid: 'bobby'+'@'+config.domain, name: 'bobby', subscription: 'both'});
                        } 
                        if(client.username != 'tomburton') {
                            query.c("item", {approved: true, jid: 'tomburton'+'@'+config.domain, name: 'tomburton', subscription: 'both'});
                        }
                            //query.c("item", {approved: true, jid: 'ching'+'@'+config.domain, name: 'ching', subscription: 'both'});
                        console.log("Send Roster: "+stanza);
                        stanza.attrs.to = stanza.attrs.from;
                        client.send(stanza);
                    });
                }
            }
        });
    });
} 