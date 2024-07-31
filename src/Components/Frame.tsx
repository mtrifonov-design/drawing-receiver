import React from "react";
import useAppState from "../Hooks/useAppState";
import FramePreview from "./FramePreview";

function Frame({ frameIndex, currentFrame, currentLayer }: { frameIndex: number, currentFrame: number, currentLayer: string }) {

    const deleteCurrentFrame = useAppState((state: any) => state.removeCurrentFrameFromCurrentLayer);
    const setCurrentFrame = useAppState((state: any) => state.setCurrentFrameOfCurrentLayer);
    const active = frameIndex === currentFrame;
    return <div style={{
        backgroundColor: active ? "lightblue" : "white",
        padding: "5px",
        border: "1px solid black",
        marginBottom: "5px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"

    }}>
        <FramePreview frameIndex={frameIndex} currentLayer={currentLayer} />
        <button onClick={() => setCurrentFrame(frameIndex)}>Select</button>
        {active ? <button onClick={() => deleteCurrentFrame()}>Delete</button> : null}
        

    </div>;
}

export default Frame;