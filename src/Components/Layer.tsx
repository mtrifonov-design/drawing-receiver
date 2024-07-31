import React from "react";
import useAppState from "../Hooks/useAppState";
import LayerName from "./LayerName";
import { generateId } from "../Utils/Utils";
import { copyFrame } from "../Render/CreateFrame";


function Layer({layerId, currentLayer} : {layerId : string, currentLayer : string}) {
    const layer = useAppState((state : any) => state.layers[layerId]);
    const { name, visible } = layer;
    const active = layerId === currentLayer;

    const toggleVisibility = useAppState((state : any) => state.toggleLayerVisibility);
    const moveLayerUp = useAppState((state : any) => state.moveLayerUp);
    const moveLayerDown = useAppState((state : any) => state.moveLayerDown);
    const removeLayer = useAppState((state : any) => state.removeLayer);
    const selectLayer = useAppState((state : any) => state.setCurrentLayer);
    const renameLayer = useAppState((state : any) => state.renameLayer);
    const addLayer = useAppState((state : any) => state.addLayer);
    const setCurrentLayer = useAppState((state : any) => state.setCurrentLayer);
    const layers = useAppState((state : any) => state.layers);



    const handleNameChange = (newName : string) => {
        renameLayer(layerId, newName);
    }

    const duplicateLayer = () => {
        const defaultNewLayer = (id : string) => ({
            visible: true,
            name: layers[layerId].name + " copy",
            id: id,
            frames: layers[layerId].frames.map((frame : any) => copyFrame(frame)),
            currentFrame: layers[layerId].currentFrame,
            anchorPoint: [0,0],
            blendMode: "normal",
        })
        const id = generateId();
        const newLayer = defaultNewLayer(id);
        addLayer(id,newLayer);
        setCurrentLayer(id); 
    }

    return <div style={{
        backgroundColor: active ? "lightblue" : "white",
        padding: "5px",
        border: "1px solid black",
        marginBottom: "5px",
        display: "grid",
        gridTemplateColumns: "auto 100px auto auto auto auto auto",
        gap: "5px"
    }}>
        <button onClick={() => selectLayer(layerId)}>Select</button>
        <LayerName name={name} onNameChange={handleNameChange} />
        <button onClick={() => moveLayerUp(layerId)}>↑</button>
        <button onClick={() => moveLayerDown(layerId)}>↓</button>
        <button onClick={() => removeLayer(layerId)}>Delete</button>
        <button onClick={() => toggleVisibility(layerId)}>{ visible ? "Hide" : "Show"}</button>
        <button onClick={duplicateLayer}>Duplicate</button>
    </div>;
}

export default Layer;
