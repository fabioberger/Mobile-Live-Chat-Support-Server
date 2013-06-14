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

5. Install XMPP Server dependencies:
```bash
$ cd xmpp-server
$ npm install
```

6. Start the server
```bash
$ cd chatServer
$ node server
```

6. Connect to XMPP Client & Run Demo Mobile App

### Native Mobile Cient-Server Protocol

*emphasis Initialize Connection *

Client Sends:

{
	messageType: 1,
	companyKey: INSERTPUBLICKEY,
	deviceId: HASHEDMACADDRESS
} 

