const rockSockets = require('../manager/rock');
const cricketSockets = require('../manager/cricket');
const cardSockets = require('../manager/card');
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    rockSockets(io, socket);
    cricketSockets(io,socket);
    cardSockets(io,socket);
    
  });
};