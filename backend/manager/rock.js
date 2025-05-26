const { v4: uuidv4 } = require('uuid');
const rooms={}
const turn={}
module.exports=(io,socket)=>{
  socket.on('joinGame', (name) => {
    let assignedRoom=null;
    for(const roomID in rooms){
      if(rooms[roomID].length<2){
        assignedRoom=roomID;
        break;
      }
    }
    if(!assignedRoom){
      assignedRoom=uuidv4();
      rooms[assignedRoom]=[]
    }
    rooms[assignedRoom].push({ id: socket.id, name, choice: null,score:0 });
    socket.join(assignedRoom);

    console.log(`${name} joined room ${assignedRoom}`);
  if (rooms[assignedRoom].length === 1) {
      io.to(assignedRoom).emit('waiting', 'Waiting for another player...');
    }
    if (rooms[assignedRoom].length === 2) {
      const players = rooms[assignedRoom];
       turn[assignedRoom]=Math.floor(Math.random()*2);
      io.to(assignedRoom).emit('start', {
        roomId: assignedRoom,
        players
      });
       io.to(players[turn[assignedRoom]].id).emit('waitmoves',"Your Turn")
     io.to(players[(turn[assignedRoom]+1)%2].id).emit('waitmoves',"Opposition Turn")
    }
    socket.roomId = assignedRoom;
  })
socket.on('makemove',(choice)=>{
  const roomID = socket.roomId;
const room = rooms[roomID];
if (!room) {
  console.log(`Room ${roomID} not found for socket ${socket.id}`);
  socket.to(roomID).emit("playerLeft", "A player has been disconnected...");
  return;
}
const player=rooms[roomID].find((p)=>p.id==socket.id)
if (!player) {
  console.log(`Player with id ${socket.id} not found in room ${roomID}`);
  socket.to(roomID).emit("playerLeft", "A player has been disconnected...");
  return;
}
  player.choice=choice;
  const players=rooms[roomID];
  if(rooms[roomID].find((p)=>p.choice==null)==undefined){
    if(rooms[roomID].find((p)=>p.score==5)==undefined){
    const [p1,p2]=players
    const beats = {
        rock: "scissor",
        scissor: "paper",
        paper: "rock"
      };
      if (p1.choice === p2.choice) {
        p1.score=p1.score;
        p2.score=p2.score;
      } else if (beats[p1.choice] === p2.choice) {
         p1.score+=1;
      } else {
         p2.score+=1
      }
      console.log(turn)
      
          io.to(roomID).emit('scores',{
        roomId: roomID,
        players
      })
      players.forEach((i)=>i.choice=null)
    if(p1.score==5 || p2.score==5){
            if(p1.score===5){
    io.to(roomID).emit('winner',`${p1.name} is winner`)
      }
      else{
         io.to(roomID).emit('winner',`${p2.name} is winner`)
      }
      delete rooms[roomID]
      io.in(roomID).socketsLeave(roomID);

    }
           io.to(players[turn[roomID]].id).emit('waitmoves',"Your Turn")
     io.to(players[(turn[roomID]+1)%2].id).emit('waitmoves',"Opposition Turn")
    }
  }
  else{
  io.to(players[turn[roomID]].id).emit('waitmoves',"Opposition Turn")
     io.to(players[(turn[roomID]+1)%2].id).emit('waitmoves',"Your Turn")
  }
  

});
socket.on('leaveRoom', () => {
  const roomId = socket.roomId;

  if (roomId && rooms[roomId]) {
    // Remove player from the room
    rooms[roomId] = rooms[roomId].filter(p => p.id !== socket.id);

    // Notify remaining player
    socket.to(roomId).emit('opponentLeft', `${socket.name || 'A player'} left the game.`);

    // Leave the socket room
    socket.leave(roomId);

    // Cleanup if the room is empty
    if (rooms[roomId].length === 0) {
      delete rooms[roomId];
    }
  else {
          socket.to(roomId).emit("playerLeft", "A player has been disconnected...");
        }
    // Clean up socket-level info
    delete socket.roomId;

    console.log(`Socket ${socket.id} left room ${roomId}`);
  }
});
socket.once('disconnect', () => {
  console.log("Player disconnected:", socket.id);

    for (const roomId in rooms) {
      const index = rooms[roomId].findIndex(p => p.id === socket.id);
      if (index !== -1) {
        rooms[roomId].splice(index, 1);

        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
        } else {
          socket.to(roomId).emit("playerLeft", "A player has been disconnected...");
        }
        break; // Stop loop after finding the room
      }
    } // or just reuse logic
    console.log(rooms)
});
}