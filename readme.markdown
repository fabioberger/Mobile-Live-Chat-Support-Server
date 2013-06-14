## LiveMobile Server
Server backend for native app live chat support

### How to use:

1. Download and install Node.js & MongoDB

2. Start MongoDB Server
```bash
$ mongod
```

3. Navigate to correct directory:
```bash
$ cd chatServer
```

4. Install Chat Server dependencies:
```bash
$ npm install
```

5. Start the server
```bash
$ cd chatServer
$ node server
```

6. Connect to XMPP Client & Run Demo Mobile App

### Native Mobile Cient-Server Protocol

** Initialize Connection **

Mobile Client Sends:

```javascript
{
	messageType: 1,
	companyKey: INSERT_PUBLIC_KEY,
	deviceId: HASHED_MAC_ADDRESS
} 
```

On Success Server Returns:

```javascript
{
	messageType: 1,
	agentName: AGENT_USERNAME,
	messages:
		[
			{ 
				author: "agent",
				timestamp: 1370930988914,
				content: "Hi, how may I help you?"
			}
		]
} 
```

