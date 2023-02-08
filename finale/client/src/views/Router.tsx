import React, { FC, useEffect, useState } from "react";
import { SigmaContainer, ZoomControl, FullScreenControl } from "react-sigma-v2";
import { omit, mapValues, keyBy, constant } from "lodash";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";

import Root from './Root'
import Home from './Home'
import Fancy from "./FancyTemplate";


const Rout = () => {
  const [name, setName] = useState<string>('datafinale.json')
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home name={name} setName={setName}/>} />
        <Route path="graph/*" element={<Root name={name}/>} />
        <Route path="graphnew/" element={<Fancy/>} />
      </Routes>
    </Router>
  );
}

export default Rout;