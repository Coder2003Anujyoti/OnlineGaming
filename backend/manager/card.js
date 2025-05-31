const { v4: uuidv4 } = require('uuid');
const rooms={}
const turn={}
module.exports=(io,socket)=>{
  socket.on('joinCard',(name) => {
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
    rooms[assignedRoom].push({ id: socket.id, name, choice: null,score:0,image:null,value:-1,character:"",count:0});
    socket.join(assignedRoom);
     socket.roomId = assignedRoom;
    console.log(`${name} joined room ${assignedRoom}`);
  if (rooms[assignedRoom].length === 1) {
      io.to(assignedRoom).emit('waitCard', 'Waiting for another player...');
    }
    if (rooms[assignedRoom].length === 2) {
      const players = rooms[assignedRoom];
       turn[assignedRoom]=Math.floor(Math.random()*2);
       const offs=Math.floor(Math.random()*644)
       io.to(assignedRoom).emit('loadCard',{
         offs,
         msg:"Cards are Loading...."
       })
    
    }
  })
  socket.on('goCard', (msg) => {
  const roomID = socket.roomId;
  const players = rooms[roomID];

  // Defensive: check if room, players, and turn are properly set
  if (!roomID || !Array.isArray(players) || players.length !== 2 || typeof turn[roomID] !== 'number') {
    console.error("Invalid room or players for goCard", { roomID, players, turn: turn[roomID] });
    return;
  }

  const result = "";
  
  io.to(roomID).emit('startCard', {
    roomId: roomID,
    players,
    result: ""
  });

  const currentTurnIndex = turn[roomID];
  const nextTurnIndex = (currentTurnIndex + 1) % 2;

  io.to(players[currentTurnIndex].id).emit('moveCard', "Your Turn");
  io.to(players[nextTurnIndex].id).emit('moveCard', "Opposition Turn");
  socket.roomId = roomID;
});
  socket.on('makeCard',(item)=>{
    const roomID = socket.roomId;
const room = rooms[roomID];
if (!room) {
  console.log(`Room ${roomID} not found for socket ${socket.id}`);
  socket.to(roomID).emit("cardLeft", "A player has been disconnected...");
  return;
}
const player=rooms[roomID].find((p)=>p.id==socket.id)
if (!player) {
  console.log(`Player with id ${socket.id} not found in room ${roomID}`);
  socket.to(roomID).emit("cardLeft", "A player has been disconnected...");
  return;
}
player.choice=item.choice;
player.image=item.image;
player.character=item.character;
player.value=item.value;
const players=rooms[roomID];
  if(rooms[roomID].find((p)=>p.choice==null)==undefined){
  if(rooms[roomID].find((p)=>p.count==6)==undefined){
    const [p1,p2]=players;
    let result=''
    p1.count+=1
    p2.count+=1
    if(p1.value>p2.value)
    {
      p1.score+=1  
      p2.score=p2.score
    }
    else if(p1.value < p2.value)
    {
      p1.score=p1.score  
      p2.score+=1
    }
    else{
      p1.score=p1.score
      p2.score=p2.score
    }
    if(p1.count==6 && p2.count==6){
          if(p1.score>p2.score){
      result=`${p1.name} is winner`
       io.to(roomID).emit('scoreCard', {
        players,
        result
      });
    }
    else if(p2.score>p1.score){
      result=`${p2.name} is winner`
      io.to(roomID).emit('scoreCard', {
        players,
        result
      });
    }
    else{
      result='Match is tied'
     io.to(roomID).emit('scoreCard', {
        players,
        result
      });
    }
    delete rooms[roomID]
      io.in(roomID).socketsLeave(roomID);
    }
    console.log(players)
   io.to(roomID).emit('scoreCard', {
       roomId:roomID,
        players,
        result
      });
      players.forEach((i)=>i.choice=null)
        io.to(players[turn[roomID]].id).emit('moveCard',"Your Turn")
     io.to(players[(turn[roomID]+1)%2].id).emit('moveCard',"Opposition Turn")
}

  
  }
    else{
  io.to(players[turn[roomID]].id).emit('moveCard',"Opposition Turn")
     io.to(players[(turn[roomID]+1)%2].id).emit('moveCard',"Your Turn")
  }
  })
  socket.once('disconnect', () => {
  console.log("Player disconnected:", socket.id);

    for (const roomId in rooms) {
      const index = rooms[roomId].findIndex(p => p.id === socket.id);
      if (index !== -1) {
        rooms[roomId].splice(index, 1);

        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
        } else {
          socket.to(roomId).emit("cardLeft", "A player has been disconnected...");
        }
        break; // Stop loop after finding the room
      }
    } // or just reuse logic
    console.log(rooms)
});
}