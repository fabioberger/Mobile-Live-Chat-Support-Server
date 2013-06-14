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

Mobile Client Sends:

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

On Success Server Returns:

```javascript
{
	messageType: 0,
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

On Success Server Returns:

```javascript
{
	messageType: 0,
	request: 3,
} 
```


#### __Error Message__

Mobile Client OR Server Sends:

```javascript
{
	messageType: 4,
	request: 1,
	error: "Invalid Company Public Key",	
} 
```
_Request:_ the messageType of the request that caused the error


