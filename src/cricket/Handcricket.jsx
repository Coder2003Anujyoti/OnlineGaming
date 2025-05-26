import React,{useState,useEffect,useRef} from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaPaperPlane } from 'react-icons/fa';
import { FaArrowUp } from "react-icons/fa";
import {HashLink} from 'react-router-hash-link'
import {io} from "socket.io-client";
let socket;
const Handcricket = () => {
const [load,setLoad]=useState(true)
const [text,setText]=useState("")
const [msg,setMsg]=useState("")
const [start,setStart]=useState(false)
const [data,setData]=useState([])
const [opt,setOpt]=useState(0)
const [imp,setImp]=useState("")
const [disable,setDisable]=useState(false)
const buttons=[1,2,3,4,5,6]
const inactivityTimeout = useRef(null);
const countdownInterval = useRef(null);
const [timer, setTimer] = useState(20);
  const triggerInactivity = () => {
    setImp('Connection issues...');
    socket.disconnect()
  };
  const resetInactivityTimer = () => {
  if (!start || data.game.result !== "") return;
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
    socket.on('wait', (message) => {
    setMsg(message);
  });

  socket.on('startGame', (message) => {
    setStart(true);
    setMsg("")
    setData(message);
  });
  socket.on('choiceturn',(ms)=>{
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
  socket.on('makescore',(mesg)=>{
  if(mesg.game.result!=''){
  clearInterval(countdownInterval.current);
    clearTimeout(inactivityTimeout.current);
  }
    setData(mesg)
  })
  socket.on('Left',(mseg)=>{
  clearInterval(countdownInterval.current);
  clearTimeout(inactivityTimeout.current);
    setImp(mseg)
  
  })
  return () => {
    socket.off('wait')
    socket.off('Left')
    socket.disconnect()// Clean up
    clearInterval(countdownInterval.current);
    clearTimeout(inactivityTimeout.current);
  };
}, []);
useEffect(() => {
  if (start==true && data.game.result === "" && msg === "Your Turn") {
    resetInactivityTimer();
  }
}, [start, msg]);
const add_Name=()=>{
  if (text.trim()!='') {
    socket.emit('joinRoom', text);
    setDisable(true)
    }
}
const optio=(i)=>{
  socket.emit('gomove',i)
  clearInterval(countdownInterval.current);
  clearTimeout(inactivityTimeout.current);
  setOpt(i)
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
   <div className="w-full flex justify-center items-center my-36">
    <img src="Home/Lock.png" className="w-72 h-72" />
    </div>
    </>
  }
  { load==false && <>
    <div className="w-full h-18 flex gap-x-6 bg-purple-800">
  <HashLink smooth to='/'>
  <img src="Home/Loads.png"  className="w-16 h-16 ml-2"/>
  </HashLink>
  </div>
{ start===false && imp=='' && <>
{ msg=='' && 
<>
  <div className="flex justify-center mt-6">
  <div className="relative w-72">
    <input
      type="text" value={text}  onChange={(e)=>setText(e.target.value)} 
      placeholder="Type your Name..."
      className="w-full font-bold px-4 py-2 pr-10  rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
    />
    <button className="bg-purple-800" onClick={add_Name} disabled={disable}>
    <FaPaperPlane  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 text-xl"  />
    </button>
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
  start==true && imp==''  && <>
  <div className="w-full my-4 font-bold text-center">
{ msg=="Your Turn" && data.game.result=='' && <h2 className="text-center font-bold text-black">
  You have {timer} seconds to choose!
</h2>}
{ data.game.result=="" && <h1 className="my-2">{data.game.turn} start to Bat </h1>}
     <div className="w-full flex justify-center flex-row flex-wrap my-6 gap-x-12">
    {data.players.map((i)=>{
      return(<>
        <div className="flex flex-col text-center items-center justify-center gap-y-2">
        <h1 className="text-base shadow-slate-400 font-extrabold text-black ">{i.name}</h1>
<img className="rounded-md w-28 h-28" src="Home/users.png" />
{
  data.game.turn===i.name && <img className=" w-10 h-10" src="images/cricket-bat (1).png" />
}
{
  data.game.turn!==i.name && <img className=" w-10 h-10" src="images/ball.png" />
}
  <h1 className="text-center font-bold">{i.choice}</h1>
        </div>
      </>)
    })}
    </div>
{ data.game.result=='' && <h1 className="text-center font-bold">{msg}</h1>}
{ msg=="Your Turn" && data.game.result=='' &&
 <div className="flex flex-row flex-wrap justify-center py-12 gap-3">
      {buttons.map((i)=>{
        return(<>
          <div className="w-12 h-12 text-center flex items-center justify-center rounded-full bg-purple-800" >
            <button className="text-xl text-white font-bold" onClick={()=>optio(i)}>{i}</button>
          </div>
        </>)
      })}
    </div>
    }
  {
    msg=="Opposition Turn" && data.game.result=="" &&  opt!=0 &&
    <>
    <div className="flex flex-col text-center justify-center items-center font-bold my-8 gap-6">
    <h1>You choose</h1>
    <img src={`images/number-${opt}.png`} className="rounded-full w-16 h-16"/>
    </div>
    </>
  }
  { data.game.result=='' &&
    <div className="w-full text-center font-bold">
  <h1 className="my-2">Runs scored by {data.game.turn}-: {data.game.scores[data.game.turn]} run(s)</h1>
  {data.game.innings==2 &&  <h1 className="my-2">Target is {data.game.target} run(s)</h1>}
  </div>
  }
  {
    data.game.result!='' && 
        <div className="text-center flex flex-col gap-1 justify-center items-center font-bold my-10">
        <img src="images/trophi.png" className=" w-16 h-16"/>
    <h1>{data.game.result}</h1>
    {
      Object.entries(data.game.scores).map(([key,value])=>{
        return(<>
        <h1>Runs scored by {key}-: {value}</h1>
        </>)
      })
    }
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
  );
};


export default Handcricket;
