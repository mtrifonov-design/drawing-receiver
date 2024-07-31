import React from "react";
import Tools from "./Tools";
import LayerList from "./LayerList";
import Flipbook from "./Flipbook";

function Island() {
  return <div style={{
    left: "0",
    top: "0",
    border: "1px solid #ccc",
    padding: "10px",
    backgroundColor:"aliceblue",
    position: "absolute",
  }}>
    <Tools />
    <hr style={{marginTop:"15px"}} />
    <LayerList />
    <hr style={{marginTop:"15px"}} />
    <Flipbook />
  </div>;
}

export default Island;