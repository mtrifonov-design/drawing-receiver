
import {create} from 'zustand';
import { produce } from 'immer';
import type { LayerCollection, Layer, Frame } from '../Types/Types';
import Dimensions from '../Constants/Dimensions';



const useAppState = create(
  (set,get) => ({
    width: Dimensions.width,
    height: Dimensions.height,
    setDimensions: (newWidth : number, newHeight : number) => {
        set(produce((state : any) => {
            state.width = newWidth;
            state.height = newHeight;
        }))
    },
    brushSize: 10,
    setBrushSize: (newSize : number) => {
        set(produce((state : any) => {
            state.brushSize = newSize;
        }))
    },
    boxesVisible: false,
    setBoxesVisible: (newBoxesVisible : boolean) => {
        set(produce((state : any) => {
            state.boxesVisible = newBoxesVisible;
        }))
    },
    onionSkin: false,
    setOnionSkin: (newOnionSkin : boolean) => {
        set(produce((state : any) => {
            state.onionSkin = newOnionSkin;
        }))
    },
    currentTool: 'brush',
    setCurrentTool: (newTool : string) => {
        set(produce((state : any) => {
            state.currentTool = newTool;
        }))
    },
    currentColor: '#000000',
    setCurrentColor: (newColor : string) => {
        set(produce((state : any) => {
            state.currentColor = newColor;
        }))
    },
    uiMode: 'preview',
    setUiMode: (newUIMode : string) => {
        set(produce((state : any) => {
            state.uiMode = newUIMode;
    }))},
    layers: {},
    layerOrder: [],
    currentLayer: undefined,
    uniqueLayerCount: 1,
    incrementUniqueLayerCount: () => {
        set(produce((state : any) => {
            state.uniqueLayerCount++;
        }))
    },
    renameLayer: (layerID : string, newName : string) => {
        set(produce((state : any) => {
            state.layers[layerID].name = newName;
        }))
    },
    addLayer: (id: string, newLayer : Layer) => {
        set(produce((state : any) => {
            state.layers[id] = newLayer;
            state.layerOrder.push(id);
        }))
    },

    removeLayer: (layerID : string) => {
        set(produce((state : any) => {
            delete state.layers[layerID];
            state.layerOrder = state.layerOrder.filter((id : string) => id !== layerID);
        }))
    },
    setCurrentLayer: (layerID : string) => {
        set(produce((state : any) => {
            state.currentLayer = layerID;
        }))
    },
    moveLayerUp: (layerID : string) => {

        set(produce((state : any) => {
            const index = state.layerOrder.indexOf(layerID);
            if (index < state.layerOrder.length - 1) {
                state.layerOrder.splice(index, 1);
                state.layerOrder.splice(index + 1, 0, layerID);
            }
        }))
    },
    moveLayerDown: (layerID : string) => {

        set(produce((state : any) => {
            const index = state.layerOrder.indexOf(layerID);
            if (index > 0) {
                state.layerOrder.splice(index, 1);
                state.layerOrder.splice(index - 1, 0, layerID);
            }
        }))
    },
    toggleLayerVisibility: (layerID : string) => {
        set(produce((state : any) => {
            const visible = (get() as any).layers[layerID].visible;
            state.layers[layerID].visible = !visible;
        }))
    },

    addFrameToCurrentLayer: (frame : Frame) => {
        set(produce((state : any) => {
            const currentLayer : string = (get() as any).currentLayer;
            state.layers[currentLayer].frames.push(frame);
        }))
    },
    removeCurrentFrameFromCurrentLayer: () => {
        set(produce((state : any) => {
            const currentLayer : string = (get() as any).currentLayer;
            const currentFrame : number = (get() as any).layers[currentLayer].currentFrame;
            if (currentFrame === undefined) { 
                return;
            }
            let newCurrentFrame;
            state.layers[currentLayer].frames.splice(currentFrame, 1);
            if (currentFrame > (get() as any).layers[currentLayer].frames.length - 2) {
                newCurrentFrame = (get() as any).layers[currentLayer].frames.length - 2;
                state.layers[currentLayer].currentFrame = newCurrentFrame;
            }
            if (state.layers[currentLayer].frames.length === 0) {
                newCurrentFrame = undefined;
                state.layers[currentLayer].currentFrame = newCurrentFrame;
            }
            console.log(newCurrentFrame);
        }))
    },
    setCurrentFrameOfCurrentLayer: (index : number | undefined) => {
        set(produce((state : any) => { 
            if (index === undefined) {
                index = (get() as any).layers[(get() as any).currentLayer].frames.length -1 ;
            }
            const currentLayer : string = (get() as any).currentLayer;
            state.layers[currentLayer].currentFrame = index;
        }))
    },
    getStateForExport: () => {
        const state : any = get();
        return {
            brushSize: state.brushSize,
            onionSkin: state.onionSkin,
            currentTool: state.currentTool,
            currentColor: state.currentColor,
            layers: state.layers,
            layerOrder: state.layerOrder,
            currentLayer: state.currentLayer,
            width: state.width,
            height: state.height,
            boxesVisible: state.boxesVisible
        }
    },
    initStateFromExport: (exportedState : any) => {
        set(produce((state : any) => {
            state.brushSize = exportedState.brushSize;
            state.onionSkin = exportedState.onionSkin;
            state.currentTool = exportedState.currentTool;
            state.currentColor = exportedState.currentColor;
            state.layers = exportedState.layers;
            state.layerOrder = exportedState.layerOrder;
            state.currentLayer = exportedState.currentLayer;
            state.width = exportedState.width;
            state.height = exportedState.height;
            state.boxesVisible = exportedState.boxesVisible;
        }))
    }
}));

export default useAppState;