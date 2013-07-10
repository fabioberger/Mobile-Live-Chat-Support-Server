## Live Chat Server
Server backend for native app live chat support written in Node.js. Includes XMPP server to respond to chat inquiries from XMPP clients. A working iOS Chat library with UI can be found here: https://github.com/soroushjp/Live-Chat-iOS-SDK

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

0. Install Chat Server dependencies:
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

#### __Initialize Connection__

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
				timestamp: 1370930988910,
				content: "Hi, how may I help you?"
			}
		]
} 
```

#### __Send Message__

Mobile Client or Server Sends:

```javascript
{
	messageType: 2,
	message:
		{ 
			author: "customer",
			timestamp: 1370930988914,
			content: "Hi, do you have this suit in grey?"
		}
} 
```
_author:_ the sender (either "customer" or "agent")

On Recepit, Server/Client Returns:

```javascript
{
	messageType: 4,
	request: 2,
} 
```
_Request:_ the messageType of the request that was successfully received


#### __Agent Status__

Server Sends:

```javascript
{
	messageType: 3,
	agent: AGENT_USERNAME,
	status: "offline"
	
} 
```
_Status Options:_ offline, online, composing, paused

On Success Client Returns:

```javascript
{
	messageType: 4,
	request: 3,
} 
```


#### __Error Message__

Mobile Client OR Server Sends:

```javascript
{
	messageType: 99,
	request: 1,
	error: "Invalid Company Public Key",	
} 
```
_Request:_ the messageType of the request that caused the error


