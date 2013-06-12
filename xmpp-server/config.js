module.exports = {
    port: 5222,
    domain: 'localhost',

    // logging
    logger: true,
    // Message response
    message: true,

    //tls: {
    //    keyPath: '/etc/xmpp-server/tls/localhost-key.pem',
    //    certPath: '/etc/xmpp-server/tls/localhost-cert.pem'
    //},
    
    // Listen on websockets
    websocket: {
        port: 5280
    }
};
