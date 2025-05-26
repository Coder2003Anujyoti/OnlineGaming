const { v4: uuidv4 } = require('uuid');
const rooms={}
const turn={}
const game={}
module.exports=(io,socket)=>{
  socket.on('joinRoom', (name) => {
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
    rooms[assignedRoom].push({ id: socket.id, name, choice:0 });
    socket.join(assignedRoom);

    console.log(`${name} joined room ${assignedRoom}`);
  if (rooms[assignedRoom].length === 1) {
      io.to(assignedRoom).emit('wait', 'Waiting for another player...');
    }
    if (rooms[assignedRoom].length === 2) {
      const players = rooms[assignedRoom];
       turn[assignedRoom]=Math.floor(Math.random()*2);
       game[assignedRoom]={
         innings:1,
         scores:{
           [players[0].name]:0,
           [players[1].name]:0
         },
         turn:Math.random()>0.5?players[0].name:players[1].name,
         target:-1,
         result:""
       }
      io.to(assignedRoom).emit('startGame', {
        roomId: assignedRoom,
        players,
        game:game[assignedRoom]
      });
       io.to(players[turn[assignedRoom]].id).emit('choiceturn',"Your Turn")
     io.to(players[(turn[assignedRoom]+1)%2].id).emit('choiceturn',"Opposition Turn")
    }
    socket.roomId = assignedRoom;
  })
socket.on('gomove', (item) => { 
  const roomId = socket.roomId; 
if (!roomId || !rooms[roomId]){
  socket.to(roomId).emit("Left", "A player has been disconnected...");
  return;
} 
const player = rooms[roomId].find(p => p.id === socket.id); 
if (!player){
  socket.to(roomId).emit("Left", "A player has been disconnected...");
return;
}
player.choice = item;
const players = rooms[roomId];
if(players.find((p) =>p.choice==0)==undefined){
  const [p1,p2]=players
  if(p1.choice!==p2.choice){
    const batter = players.find(p => p.name === game[roomId].turn);
  if(game[roomId].target==-1 || game[roomId].target> (game[roomId].scores[batter.name]+batter.choice)){
   game[roomId].scores[batter.name] += batter.choice;
  io.to(roomId).emit('makescore', {
  players,
  game: game[roomId]
});
}
else{
  game[roomId].scores[batter.name] += batter.choice;
  game[roomId].result=`${batter.name} is winner`
    io.to(roomId).emit('makescore', {
  players,
  game: game[roomId]
})
delete rooms[roomId]
  delete game[roomId]
  io.in(roomId).socketsLeave(roomId);
}
  players.forEach((c)=>c.choice=0)
    io.to(players[turn[roomId]].id).emit('choiceturn',"Your Turn")
     io.to(players[(turn[roomId]+1)%2].id).emit('choiceturn',"Opposition Turn")
  }
  else{
    if(game[roomId].innings===1){
    const batter = players.find(p => p.name === game[roomId].turn);
    const bowler = players.find(p => p.name !== game[roomId].turn);
game[roomId].target=game[roomId].scores[batter.name]+1;
game[roomId].turn=bowler.name
game[roomId].innings=2;
      players.forEach((c)=>c.choice=0)
      io.to(roomId).emit('makescore', {
  players,
  game: game[roomId]
});
}
else{
  const batter = players.find(p => p.name === game[roomId].turn);
  const bowler = players.find(p => p.name !== game[roomId].turn);
  if(game[roomId].scores[bowler.name]==game[roomId].scores[batter.name]){
    game[roomId].result=`Match is tied`
    io.to(roomId).emit('makescore', {
  players,
  game: game[roomId]
})
  }
  else
  {
    game[roomId].result=`${bowler.name} is winner`
    io.to(roomId).emit('makescore', {
  players,
  game: game[roomId]
})
  }
  delete rooms[roomId]
  delete game[roomId]
  io.in(roomId).socketsLeave(roomId);
}
          io.to(players[turn[roomId]].id).emit('choiceturn',"Your Turn")
     io.to(players[(turn[roomId]+1)%2].id).emit('choiceturn',"Opposition Turn")
  }
}
else{
  io.to(players[turn[roomId]].id).emit('choiceturn',"Opposition Turn")
     io.to(players[(turn[roomId]+1)%2].id).emit('choiceturn',"Your Turn")
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
          socket.to(roomId).emit("Left", "A player has been disconnected...");
        }
        break; // Stop loop after finding the room
      }
    } // or just reuse logic
    console.log(rooms)
});
  
}