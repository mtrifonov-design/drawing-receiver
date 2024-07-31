import React from "react";
import useAppState from "../Hooks/useAppState";
import LayerName from "./LayerName";

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
    const handleNameChange = (newName : string) => {
        renameLayer(layerId, newName);
    }

    return <div style={{
        backgroundColor: active ? "lightblue" : "white",
        padding: "5px",
        border: "1px solid black",
        marginBottom: "5px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "5px"
    }}>
        <button onClick={() => selectLayer(layerId)}>Select</button>
        <LayerName name={name} onNameChange={handleNameChange} />
        <button onClick={() => moveLayerUp(layerId)}>↑</button>
        <button onClick={() => moveLayerDown(layerId)}>↓</button>
        <button onClick={() => removeLayer(layerId)}>Delete</button>
        <button onClick={() => toggleVisibility(layerId)}>{ visible ? "Hide" : "Show"}</button>
    </div>;
}

export default Layer;
