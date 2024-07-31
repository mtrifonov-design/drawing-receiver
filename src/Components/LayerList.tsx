import React from "react";
import useAppState from "../Hooks/useAppState";
import Layer from "./Layer";
import AddLayer from "./AddLayer";

function LayerList() {
    const currentLayer = useAppState((state : any) => state.currentLayer);
    const layerOrder = useAppState((state : any) => state.layerOrder);
    const displayOrder = [...layerOrder].reverse();

    return <div>
        <h3>Layers</h3>
        {
        displayOrder.map((layerId : string) => <Layer key={layerId} currentLayer={currentLayer} layerId={layerId}/>)
        }
        <AddLayer />
    </div>;
}

export default LayerList;