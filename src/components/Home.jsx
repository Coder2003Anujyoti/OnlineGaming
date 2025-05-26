import React,{useState,useEffect} from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaArrowUp } from "react-icons/fa";
import {HashLink} from 'react-router-hash-link'
import {
  FaUsers,
  FaRobot,
  FaStar,
  FaCogs,
  FaRocket,
  FaLaughBeam,
} from "react-icons/fa";
const Home = () => {
const [load,setLoad]=useState(true)
const [data,setData]=useState([])
const moments = [
  {
    title: "Stone Paper and Scissors",
    image: "Home/rpc.png", 
    path:"/homestone"// Replace with your actual image URL
  },
    {
    title: "Handcricket Game",
    image: "Home/hc.png",
    path:"/handcricket"// Replace with your actual image URL
  },
  {
        title: "Trump Cards Game",
    image: "Home/ac.png",
    path:`/card?data=${encodeURIComponent(JSON.stringify(data))}`

  }
];
const features = [
  {
    title: "Multiplayer Mode",
    icon: <FaUsers className="text-3xl text-white" />,
    desc: "Challenge real players in live matches across various games.",
  },
  {
    title: "VS Computer",
    icon: <FaRobot className="text-3xl text-white" />,
    desc: "Play offline or train your skills against intelligent bots.",
  },
  {
    title: "Stunning Graphics",
    icon: <FaStar className="text-3xl text-white" />,
    desc: "Experience beautiful visuals optimized for all devices.",
  },
  {
    title: "Smooth Performance",
    icon: <FaCogs className="text-3xl text-white" />,
    desc: "Enjoy lightning-fast gameplay and smooth UI transitions.",
  },
  {
    title: "Fast Matchmaking",
    icon: <FaRocket className="text-3xl text-white" />,
    desc: "Get into a game instantly with intelligent room matching.",
  },
  {
    title: "Fun & Competitive",
    icon: <FaLaughBeam className="text-3xl text-white" />,
    desc: "Have fun casually or climb the leaderboard in competitive mode.",
  },
];
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
    setData([...newData]); 
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
  <img src="Home/Loads.png"  onClick={()=>
    window.location.reload()} className="w-16 h-16 ml-2"/>
  </div>
<div className="w-full flex flex-col gap-8 justify-center items-center  my-4">
<img src="Home/About.png"  className="w-72 h-72 " />
</div>
<div className="p-4  my-10">
      <div className="flex md:justify-center md:items-center overflow-x-auto text-center text-white font-bold gap-4 scroll-container">
        {moments.map((moment, index) => (
        <HashLink smooth to={moment.path}>
          <div
            key={index}
            className="flex justify-center items-center flex-col bg-purple-800 rounded-lg py-4 shadow-md min-w-[250px]"
          >
          
            <img src={moment.image} alt={moment.title} className="w-32 h-32" />
            <div className="p-3">
              <h3 className=" text-sm">{moment.title}</h3>
            </div>
          </div>
          </HashLink>
        ))}
      </div>
  <div className=" p-2  text-black font-bold  mt-8 ">
    <p className="text-xs">
      Online gaming is a thrilling digital experience where players from all over the world connect in real time. Whether you're teaming up with friends or facing strangers in competitive matches, it fosters collaboration and sharpens reflexes. With the rise of AI-powered gameplay, you can also challenge intelligent virtual opponents when you're offline. The immersive graphics bring every game to life, from fast-paced battles to strategic board games. Thanks to advanced performance optimizations, our games run smoothly across devices. Fast matchmaking systems ensure you're never left waiting. Online gaming today is more than just fun—it's a global community, a growing eSport industry, and a powerful tool for entertainment, learning, and connection.
    </p>
  </div>
      <div className="py-10">
      <h2 className="text-xl font-extrabold text-center text-purple-900 mb-6">
        Gaming Features
      </h2>
      <div className="overflow-x-auto whitespace-wrap px-1 scroll-container">
        <div className="flex gap-4">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="inline-block min-w-[250px] min-h-[150px] bg-purple-800 p-6 rounded-lg shadow-md  text-center"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-extrabold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-white font-thick">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
<footer className="bg-black text-white  shadow-inner py-4">
<div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
<div>
<div className="flex items-center space-x-3 flex-col mb-4">
<img src="Home/Intro.png" className="w-54 h-36" alt="Angry Birds"  />
</div>
<p className="text-sm font-bold text-white">
Online gaming is the act of playing video games over the internet, allowing players to connect and compete with others globally. It includes various genres such as battle royale, strategy, sports, and role-playing games. Online games can be played on consoles, computers, and mobile devices.They promote entertainment, teamwork, and communication skills, and have also led to the rise of eSports and game streaming.</p></div>
<div className="space-y-4">
<h3 className="text-lg font-semibold">Connect with Us</h3>
<div className="flex space-x-5">
<FaFacebook className=" cursor-pointer text-xl" />
<FaTwitter className=" cursor-pointer text-xl" />
<FaInstagram className="cursor-pointer text-xl" />
<FaYoutube className="cursor-pointer text-xl" />
</div>
<div className="text-sm text-white">
<a>Privacy Policy</a> ·
<a  className="ml-2 ">Terms of Service</a>
</div>
</div> </div>
<div className="text-center mt-8 p-4 text-sm text-white border-t border-white ">
<p>  © {new Date().getFullYear()} Gaming Universe. All rights reserved.</p>
</div>
<button
  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
  className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-purple-600 text-white p-2 sm:p-3 rounded-full shadow-md sm:shadow-lg transition-all duration-300 z-50"
  aria-label="Scroll to top"
>
  <FaArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
</button>
</footer>
</>}
  </>
  );
};
export default Home;