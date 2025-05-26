import React,{useState,useEffect,useRef} from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaPaperPlane } from 'react-icons/fa';
import { FaArrowUp } from "react-icons/fa";
import {HashLink} from 'react-router-hash-link'
import {io} from "socket.io-client";
let socket;
const HomeStone = () => {
const [load,setLoad]=useState(true)
const [text,setText]=useState("")
const [msg,setMsg]=useState("")
const [start,setStart]=useState(false)
const [data,setData]=useState([])
const [choice,setChoice]=useState("")
const [winner,setWinner]=useState("")
const [imp,setImp]=useState("")
const [timer, setTimer] = useState(20);
const countdownInterval = useRef(null);
const inactivityTimeout = useRef(null);
  const triggerInactivity = () => {
    setImp('Connection issues...');
    socket.disconnect()
  };
  const resetInactivityTimer = () => {
  if (!start || winner !== "") return;
  if (inactivityTimeout.current) {
  clearTimeout(inactivityTimeout.current);
  }
  if (countdownInterval.current) {
  clearInterval(countdownInterval.current);
}
  inactivityTimeout.current = setTimeout(triggerInactivity,20000);
  setTimer(20);
  countdownInterval.current = setInterval(() => {
    setTimer(prev => {
      if (prev <= 1) {
        clearInterval(countdownInterval.current);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};
 useEffect(()=>{
   window.scrollTo({ top: 0, behavior: "smooth" });
 },[])
 useEffect(() => {
  socket = io('https://cruel-ginger-apisjdjjd-e9ce50b1.koyeb.app/');

  socket.on('waiting', (message) => {
    setMsg(message);
  });

  socket.on('start', (message) => {
    setStart(true);
    setMsg("")
    setData(message);
  });
socket.on('scores',(message)=>{
    setData(message)
    })
  socket.on('waitmoves',(ms)=>{
      if(ms=="Your Turn"){
    setMsg(ms)
    resetInactivityTimer();
    }
    else{
      setMsg(ms)
      clearInterval(countdownInterval.current);
    clearTimeout(inactivityTimeout.current);
    setTimer(0)
    }
  })
  socket.on('winner',(m)=>{
   clearInterval(countdownInterval.current);
   clearTimeout(inactivityTimeout.current);
    setWinner(m)
  })
  socket.on('playerLeft',(msg)=>{
   clearTimeout(inactivityTimeout.current);
   clearInterval(countdownInterval.current);
    setImp(msg)
  })
  return () => {
    socket.off('waiting')
    socket.off('playerLeft')
    socket.disconnect()// Clean up
    clearInterval(countdownInterval.current);
    clearTimeout(inactivityTimeout.current);
  };
}, []);
useEffect(() => {
  if (start==true && winner === "" && msg === "Your Turn") {
    resetInactivityTimer();
  }
}, [start, msg]);
const add_Name=()=>{
  if (text.trim()!='') {
    
    socket.emit('joinGame', text);
    
    }
}
const go_choice=(i)=>{
 socket.emit('makemove',i)
 clearInterval(countdownInterval.current);
 clearTimeout(inactivityTimeout.current);
  setChoice(i)
}
const go_items = async (it) => {
  if (load === true) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${it}&limit=6`);
    const datas = await res.json();
    const detailedPokemonData = datas.results.map(async (curPokemon) => {
      const res = await fetch(curPokemon.url);
      return await res.json();
    });
    const detailedResponses = await Promise.all(detailedPokemonData);
    setTimeout(() => {
      setLoad(false);
    }, 1200);
  }
};
useEffect(()=>{
const offs=Math.floor(Math.random()*644)
  go_items(offs);
},[])
  return (
  <>
    {
    load==true && <>
    <div className="w-full flex justify-center items-center my-32">
    <img src="Home/Load.png" className="w-54 h-54" />
    </div>
    </>
  }
  { load===false && <>
    <div className="w-full h-18 flex gap-x-6 bg-purple-800">
  <HashLink smooth to='/'>
  <img src="Home/Loads.png"  className="w-16 h-16 ml-2"/>
  </HashLink>
  </div>
{ start===false && <>
{ msg=='' && 
<>
  <div className="flex justify-center mt-6">
  <div className="relative w-72">
    <input
      type="text" value={text}  onChange={(e)=>setText(e.target.value)} 
      placeholder="Type your Name..."
      className="w-full font-bold px-4 py-2 pr-10  rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
    />
    <FaPaperPlane onClick={add_Name}  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 text-xl" />
</div>
</div>

</>
}
{ msg!="" &&
<div className="my-44 text-center font-bold">
<h1>Waiting for another player..... 
</h1>
</div>
}
</>
}
{
  start==true && imp=='' && <>
  <div className="w-full my-8">
  { msg=="Your Turn" && winner=='' && <h2 className="text-center font-bold text-black my-4">
  You have {timer} seconds to choose!
</h2>}
     <div className="w-full flex justify-center flex-row flex-wrap my-6 gap-x-12">
    {data.players.map((i)=>{
      return(<>
        <div className="flex flex-col text-center justify-center gap-y-2">
        <h1 className="text-base shadow-slate-400 font-extrabold text-black ">{i.name}</h1>
     {i.choice!=null  && <img className="rounded w-28 h-28" src={`images/${i.choice}.png`} />}
    {i.choice==null && <img className="rounded-md w-28 h-28" src="Home/users.png" />}
  <h1 className="text-center font-bold">{i.score}</h1>
        </div>
      </>)
    })}
    </div>
  { winner=='' && <h1 className="text-center font-bold">{msg}</h1>}
    { ( msg==="Your Turn") && winner=='' && 
            <div className="w-full flex flex-row flex-wrap justify-center gap-4 my-12">
  <img src="images/rock.png" onClick={()=>go_choice("rock")} className="rounded-full w-24 h-24" ></img>
  <img src="images/paper.png" className="rounded-full w-24 h-24" onClick={()=>go_choice("paper")} ></img>
  <img src="images/scissor.png" className="rounded-full w-24 h-24" onClick={()=>go_choice("scissor")}></img>
  </div>
  }
  {
    msg=="Opposition Turn" && winner=="" && choice!="" &&
    <>
    <div className="flex flex-col text-center justify-center items-center font-bold my-8 gap-6">
    <h1>Your move </h1>
    <img src={`images/${choice}.png`} className="rounded-full w-28 h-28"/>
    </div>
    </>
  }
  {
    winner!='' && 
    <div className="text-center flex flex-col gap-4 justify-center items-center font-bold my-16">
        <img src="images/trophi.png" className=" w-16 h-16"/>
    <h1>{winner}</h1>
     <button className="w-28 py-2 my-6 px-2 flex justify-center items-center bg-purple-700 text-white rounded-md font-bold" onClick={()=>window.location.reload()}>Restart</button>
    </div>
  }
    </div>
  </>
}
{
    imp!='' && 
    <div className="text-center flex flex-col gap-4 justify-center items-center font-bold my-44">
    <h1>{imp}</h1>
     <button className="w-28 py-2 my-6 px-2 flex justify-center items-center bg-purple-700 text-white rounded-md font-bold" onClick={()=>window.location.reload()}>Restart</button>
    </div>
}
  </>
  }
  </>
  )}
  export default HomeStone