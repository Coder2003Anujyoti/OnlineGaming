import { useState,useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from './components/Home'
import HomeStone from './stone/HomeStone'
import Handcricket from './cricket/Handcricket'
import Card from './card/Card'
const App=()=>{
useEffect(()=>{
   document.body.className="bg-purple-400"
 })
  return(<>
  <Router>
  <Routes>
  <Route path="/" element={<Home />} />
<Route path="/homestone" element={<HomeStone />} />
<Route path="/handcricket" element={<Handcricket />} />
<Route path="/card" element={<Card />} />
  </Routes>
  </Router>
  </>)
}

export default App