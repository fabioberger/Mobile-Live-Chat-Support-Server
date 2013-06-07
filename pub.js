var redis = require("redis");
var agent = redis.createClient();
var agent2 = redis.createClient();

redis.debug_mode = false;

// Most clients probably don't do much on "subscribe".  This example uses it to coordinate things within one program.
agent.on("subscribe", function (channel, count) {
    console.log("agent subscribed to " + channel + ", " + count + " total subscriptions");
});

agent.on("unsubscribe", function (channel, count) {
    console.log("agent unsubscribed from " + channel + ", " + count + " total subscriptions");
    if (count === 0) {
        customer.end();
        agent.end();
    }
});

agent.on("message", function (channel, message) {
    var msg = JSON.parse(message);
    console.log("Customer Says: " + msg.content);
});

agent.on("ready", function () {
    // if you need auth, do it here
    console.log("ready!");
    //agent.incr("did a thing");
    agent.subscribe("test");
});


agent2.on("ready", function () {
    // if you need auth, do it here
    console.log("ready!");
});

process.stdin.resume();
  process.stdin.setEncoding('utf8');
  var util = require('util');

  process.stdin.on('data', function (text) {
    //console.log('Agent Says:', util.inspect(text));
    var timestamp = new Date().getTime();
    var msg = { "messageType": 2, "message": {"content": text, "timestamp": timestamp, "author": "agent"}};
    var msg_stringified = JSON.stringify(msg);
    agent2.publish("test2", msg_stringified);
    if (text === 'quit\n') {
      done();
    }
  });

  function done() {
    console.log('Now that process.stdin is paused, there is nothing more to do.');
    process.exit();
  }