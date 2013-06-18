module.exports = {
    port: 5222,
    domain: 'localhost',

    // logging
    logger: true,

    //tls: {
    //    keyPath: '/etc/xmpp_server/tls/localhost-key.pem',
    //    certPath: '/etc/xmpp_server/tls/localhost-cert.pem'
    //},
    
    // Listen on websockets
    websocket: {
        port: 5280
    }
};
