
import React from "react";
import useAppState from "../Hooks/useAppState";
import Frame from "./Frame";
import AddFrame from "./AddFrame";
import OnionSkin from "./OnionSkin";

function Flipbook() {
  const currentLayer = useAppState((state : any) => state.currentLayer);
  const layers = useAppState((state : any) => state.layers);
  const frames = currentLayer ? layers[currentLayer].frames : [];
  const currentFrame = currentLayer ? layers[currentLayer].currentFrame : undefined;

  if (currentLayer === undefined) {
    return <div>
      No layer selected
    </div>
  }
  return <div style={{
  }}>
    <h3>Flipbook</h3>
    <div style={{
    width: "100%",
    overflowX: "scroll",
    display: "flex",
    flexDirection: "row",


  }}>
    {frames.map((frame : any, index : number) => {
      return <Frame key={index} frameIndex={index} currentFrame={currentFrame} currentLayer={currentLayer}/>

    })}

  </div>
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      marginTop: "10px"
    }}>
    <AddFrame />
    <OnionSkin />
    </div>
  </div>
}

export default Flipbook;