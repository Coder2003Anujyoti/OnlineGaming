const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const setupSockets = require('./sockets/index');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true}));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  },
  pingInterval: 5000,  
  pingTimeout: 15000
});
setupSockets(io);
server.listen(8000, () => {
  console.log('Server running on port 8000');
});