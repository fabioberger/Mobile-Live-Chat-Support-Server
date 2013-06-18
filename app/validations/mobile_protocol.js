/**
* JSON Request Schemas for validation
*/

// Request received confirmation format (messageType: 0)
exports.received = {
  "type":"object",
  "required":true,
  "properties":{
    "messageType": {
      "type":"number",
      "required":true
    },
    "request": {
      "type":"number",
      "required":true
    }
  }
}

// Init request format (messageType: 1)
exports.init = {
  "type":"object",
  "required":true,
  "properties":{
    "companyKey": {
      "type":"number",
      "required":true
    },
    "deviceId": {
      "type":"number",
      "required":true
    },
    "messageType": {
      "type":"number",
      "required":true
    }
  }
}


// Message request format (messageType: 2)
exports.msg = {
  "type":"object",
  "required":true,
  "properties":{
    "messageType": {
      "type":"number",
      "required":true
    },
    "message": {
      "type":"object",
      "required":true,
      "properties":{
        "author": {
          "type":"string",
          "required":true
        },
        "content": {
          "type":"string",
          "required":true
        },
        "timestamp": {
          "type":"string",
          "required":true
        }
      }
    }
  }
};


// Error request format (messageType: 4)
exports.error = {
  "type":"object",
  "required":true,
  "properties":{
    "error": {
      "type":"string",
      "required":true
    },
    "messageType": {
      "type":"number",
      "required":true
    },
    "request": {
      "type":"number",
      "required":true
    }
  }
}
