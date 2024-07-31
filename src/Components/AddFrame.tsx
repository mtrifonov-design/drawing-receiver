import React from "react";
import useAppState from "../Hooks/useAppState";
import { createFrame } from "../Render/CreateFrame";


function AddFrame() {
    const addFrame = useAppState((state: any) => state.addFrameToCurrentLayer);
    const setCurrentFrame = useAppState((state:any) => state.setCurrentFrameOfCurrentLayer);

    const newFrameHandler = () => {
        const frame = createFrame();
        addFrame(frame);
        setCurrentFrame();
    }




    return <div>
        <button onClick={newFrameHandler}>Add Frame</button>
    </div>;
}

export default AddFrame;