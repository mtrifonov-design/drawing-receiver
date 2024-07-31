import React from "react";
import useAppState from "../Hooks/useAppState";
import { Layer } from "Types/Types";
import {generateId} from "../Utils/Utils";
import { createFrame } from "../Render/CreateFrame";


function AddLayer() {
    const addLayer = useAppState((state : any) => state.addLayer);
    const uniqueLayerCount = useAppState((state : any) => state.uniqueLayerCount);
    const incrementUniqueLayerCount = useAppState((state : any) => state.incrementUniqueLayerCount);
    const setCurrentLayer = useAppState((state : any) => state.setCurrentLayer);
    const defaultNewLayer = (id : string) => ({
        visible: true,
        name: "Layer "+uniqueLayerCount,
        id: id,
        frames: [
            createFrame(),
        ],
        currentFrame: 0,
        anchorPoint: [0,0],
        blendMode: "normal",
    })

    return <div>
        <button onClick={() => {
            const id = generateId();
            const newLayer = defaultNewLayer(id);
            addLayer(id,newLayer);
            setCurrentLayer(id); 
            incrementUniqueLayerCount()

            }}>Add Layer</button>
    </div>;
}

export default AddLayer;