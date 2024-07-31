import React, { useEffect } from "react";
import useAppState from "../Hooks/useAppState";
import { saveResources, clearResources } from "../Resources/Resources";

function Tools() {
    const getStateForExport = useAppState((state : any) => state.getStateForExport);
    const saveToStorage = () => {
        const state = getStateForExport();
        saveResources(state);
    }
    const clear = () => {
        clearResources();
    }
    const currentColor = useAppState((state : any) => state.currentColor);
    const boxesVisible = useAppState((state : any) => state.boxesVisible);
    const brushSize = useAppState((state : any) => state.brushSize);
    const setCurrentColor = useAppState((state : any) => state.setCurrentColor);
    const setBrushSize = useAppState((state : any) => state.setBrushSize);
    const setBoxesVisible = useAppState((state : any) => state.setBoxesVisible);



    const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentColor(event.target.value);
    }
    const handleBrushSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBrushSize(parseInt(event.target.value));
    }
    const handleBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBoxesVisible(event.target.checked);
    }

    // useEffect(() => {
    //     if (colorRef.current) {
    //         colorRef.current.addEventListener('change', (event) => {
    //             const value = colorRef.current ? colorRef.current.value : null;
    //             setCurrentColor(value);
    //         });
    //     }

    //     if (boxRef.current) {
    //         boxRef.current.addEventListener('change', (event) => {
    //             const value = boxRef.current ? boxRef.current.checked : false;
    //             setBoxesVisible(value);
    //         });
    //     }

    //     if (rangeRef.current) {
    //         rangeRef.current.addEventListener('change', (event) => {
    //             const value = rangeRef.current ? rangeRef.current.value : "10";
    //             console.log("value", value);    
    //             setBrushSize(parseInt(value));
    //         });
    //     }
    // });

    return <div style={{
    }}>
        <h3>Tools</h3>
        <div style={{
            display: "flex",
            flexDirection: "column",
        }}>
        <input type="color" 
            value={currentColor}
            onChange={handleColorChange} />
        <input 
            type="range" 
            min="1"
            max="100"
            step="1"
            value={brushSize}
            onChange={handleBrushSizeChange}
        />
        <button onClick={saveToStorage}>Save</button>
        <button onClick={clear}>Clear</button>
        <div>        
            <label>Show Boxes</label>
            <input type="checkbox"
                checked={boxesVisible}
                onChange={handleBoxChange}
            ></input>
        </div>

        </div>

    </div>;
}

export default Tools;