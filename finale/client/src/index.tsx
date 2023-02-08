import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import Root from "./views/Root";
import Rout from "./views/Router";
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
  <React.StrictMode>
    <Rout />
  </React.StrictMode>,
  document.getElementById("root"),
);
