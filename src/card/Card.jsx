import React,{useState,useEffect,useRef} from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaPaperPlane } from 'react-icons/fa';
import { FaArrowUp } from "react-icons/fa";
import {HashLink} from 'react-router-hash-link'
import {io} from "socket.io-client";
import { useLocation } from "react-router-dom";
let socket;
const Card = () => {
 const [load,setLoad]=useState(true)
const [text,setText]=useState("")
const [msg,setMsg]=useState("")
const [start,setStart]=useState(false)
const [items,setItems]=useState([])
const [data,setData]=useState([])
const [toggle,setToggle]=useState(false)
const [image,setImage]=useState(null)
const [mode,setMode]=useState(null)
const [value,setValue]=useState(null)
const [character,setCharacter]=useState(null)
const buttons=["attack","defence","speed","hp"]
const [imp,setImp]=useState("")
const [timer, setTimer] = useState(30);
const countdownInterval = useRef(null);
const inactivityTimeout = useRef(null);
  const triggerInactivity = () => {
    setImp('Connection issues...');
    socket.disconnect()
  };
  const resetInactivityTimer = () => {
  if (!start || data.result !== "") return;
  if (inactivityTimeout.current) {
  clearTimeout(inactivityTimeout.current);
  }
  if (countdownInterval.current) {
  clearInterval(countdownInterval.current);
}
  inactivityTimeout.current = setTimeout(triggerInactivity,30000);
  setTimer(30);
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
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const datas = JSON.parse(decodeURIComponent(queryParams.get("data"))) || [];
  useEffect(() => {
  socket = io('https://cruel-ginger-apisjdjjd-e9ce50b1.koyeb.app/');
  socket.on('waitCard',(mseg)=>{
    setMsg(mseg)
  })
  socket.on('startCard',(msg)=>{
    setData(msg)
    setMsg("")
    setStart(true)
  })
  socket.on('moveCard',(m)=>{
  if(m=="Your Turn"){
    setToggle(false)
    setMsg(m)
    resetInactivityTimer();
    }
    else{
      setMsg(m)
      clearInterval(countdownInterval.current);
    clearTimeout(inactivityTimeout.current);
    setTimer(0)
    }
  })
  socket.on('scoreCard',(m)=>{
   if(m.result!=''){
   clearInterval(countdownInterval.current);
    clearTimeout(inactivityTimeout.current);
   }
    setData(m)
  })
  socket.on('cardLeft',(mseg)=>{
  clearInterval(countdownInterval.current);
  clearTimeout(inactivityTimeout.current);
    setImp(mseg)
  
  })
  return () => {
    socket.off('waitCard')
    socket.off('cardLeft')
    socket.disconnect()// Clean up
    clearInterval(countdownInterval.current);
    clearTimeout(inactivityTimeout.current);
  };
}, []);
useEffect(() => {
  if (start==true && data.result === "" && msg === "Your Turn") {
    resetInactivityTimer();
  }
}, [start, msg]);
const go_items = async (it) => {
  if (load === true) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${it}&limit=6`);
    const datas = await res.json();
    const detailedPokemonData = datas.results.map(async (curPokemon) => {
      const res = await fetch(curPokemon.url);
      return await res.json();
    });
    const detailedResponses = await Promise.all(detailedPokemonData);
    const newData = detailedResponses.map((i) => ({
      name: i.name,
      image: i.sprites.other.dream_world.front_default,
      attack: i.stats[1].base_stat,
      defence: i.stats[2].base_stat,
      speed: i.stats[5].base_stat,
      hp: i.stats[0].base_stat
    }));
    setItems([...newData]); 
    setTimeout(() => {
      setLoad(false);
    }, 1200);
  }
};
  useEffect(()=>{
   window.scrollTo({ top: 0, behavior: "smooth" });
 },[])
 useEffect(()=>{
const offs=Math.floor(Math.random()*644)
  go_items(offs);
},[])
  const add_Name=()=>{
    if(text.trim()!=''){
      socket.emit('joinCard',text)
    }
  }
  const choose=(i)=>{
    setImage(i.image)
    setToggle(true)
  }
  const final=(i)=>{
    const u=items.filter((it)=>it.image===image)
    const k=items.filter((it)=>it.image!=image)
    socket.emit('makeCard',{
      image:image,
      value:u[0][i],
      choice:i,
      character:u[0].name
    })
    clearInterval(countdownInterval.current);
    clearTimeout(inactivityTimeout.current);
    setMode(i)
    setValue(u[0][i])
    setItems(k)
    setCharacter(u[0].name)
    setToggle(null)
  }
  return (
  <>
    {
    load==true && <>
    <div className="w-full flex justify-center items-center my-32">
    <img src="Home/Load.png" className="w-54 h-54" />
    </div>
    </>
  }
  { load==false && <>
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
  start===true && imp=="" && <>
  <div className="w-full my-6 font-bold text-center">
  { msg=="Your Turn" && data.result=='' && <h2 className="text-center font-bold text-black my-4">
  You have {timer} seconds to choose!
</h2>}
       <div className="w-full flex justify-center flex-row flex-wrap my-6 gap-x-12">
    {data.players.map((i)=>{
      return(<>
 <div className="flex flex-col text-center items-center justify-center gap-y-2">
<h1 className="text-base shadow-slate-400 font-extrabold text-black ">{i.name}</h1>
{ i.image===null && <img className="rounded-md w-28 h-28" src="Home/users.png" />}
{ i.image!==null && <img className="w-28 h-28" src={i.image} />}
{ i.character!="" && <h1 className="text-center font-bold">{i.character}</h1>
}
{ i.value !== -1 && i.choice != null && (
  <h1 className="text-center font-bold">
    {i.choice.charAt(0).toUpperCase() + i.choice.slice(1).toLowerCase()}-: {i.value}
  </h1>
)}
<h1 className="text-center font-bold">{i.score}</h1>
        </div>
      </>)
    })}
    </div>
{ data.players.find((p)=>p.count==6)===undefined && <>
<h1 className="font-bold text-center">{msg}</h1>
{ msg=="Your Turn" && <>
{ toggle===false &&
       <div className="w-full flex justify-center flex-row flex-wrap my-6 gap-x-12 gap-y-6">
    {items.map((i)=>{
      return(<>
 <div className="flex flex-col text-center items-center justify-center gap-y-2">
 <img className="rounded-md w-20 h-20" src={i.image}  onClick={
 ()=>choose(i)}/>
        </div>
      </>)
    })}
    </div>
  }
{
  toggle==true && 
  <>
    <h1 className="text-center my-8 font-bold">Choose Mode of Power</h1>
         <div className="w-full flex justify-center flex-row flex-wrap my-6 gap-x-12 gap-y-6">
    {buttons.map((i)=>{
      return(<>
  <button onClick={()=>final(i)} className="w-28 h-10 flex justify-center items-center bg-purple-800 rounded-lg text-white">{
    i[0].toUpperCase()+i.slice(1).toLowerCase()
  }</button>
      </>)
    })}
    </div>
    </>
}
</>
}
{
  toggle===null && <>
  <div className="flex flex-col text-center justify-center items-center font-bold my-8 gap-2">
    <h1>You choose</h1>
    <img src={image} className="w-24 h-24"/>
    <h1>{character}</h1>
    <h1>{mode[0].toUpperCase()+mode.slice(1).toLowerCase()}-: {value}</h1>
    </div>
  </>
}
</>
}
{
  data.players.find((p)=>p.count==6)!==undefined && <>
          <div className="text-center flex flex-col gap-4 justify-center items-center font-bold my-16">
        <img src="images/trophi.png" className=" w-16 h-16"/>
    <h1>{data.result}</h1>
     <button className="w-28 py-2 my-6 px-2 flex justify-center items-center bg-purple-700 text-white rounded-md font-bold" onClick={()=>window.location.reload()}>Restart</button>
    </div>
  </>
}

  </div>
  </>
  }
{
  start===true && imp!="" && <>
      <div className="text-center flex flex-col gap-4 justify-center items-center font-bold my-44">
    <h1>{imp}</h1>
     <button className="w-28 py-2 my-6 px-2 flex justify-center items-center bg-purple-700 text-white rounded-md font-bold" onClick={()=>window.location.reload()}>Restart</button>
    </div>
  </>
}
  </>
}
  </>
  );
};
export default Card;
