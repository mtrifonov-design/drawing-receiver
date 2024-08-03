import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import useAppState from "../Hooks/useAppState";
import render from '../Render/Render';
import projectPointerToCanvas from '../Render/ProjectPointerToCanvas';
import Dimensions from "Constants/Dimensions";


function DrawingCanvas() {
    const width = useAppState((state : any) => state.width);
    const height = useAppState((state : any) => state.height);
    const onionSkin = useAppState((state : any) => state.onionSkin);
    const layers = useAppState((state : any) => state.layers);
    const currentColor = useAppState((state : any) => state.currentColor);
    const brushSize = useAppState((state : any) => state.brushSize);
    const currentTool = useAppState((state : any) => state.currentTool);
    const uiMode = useAppState((state : any) => state.uiMode);
    const layerOrder = useAppState((state : any) => state.layerOrder);
    const currentLayer = useAppState((state : any) => state.currentLayer);
    const boxesVisible = useAppState((state : any) => state.boxesVisible);


    const ref = useRef<HTMLCanvasElement>(null);

    const [pointerDown, setPointerDown] = useState(false);
    const [start, setStart] = useState(false);

    useEffect(() => {
      console.log("DrawingCanvas useEffect");
        let animationFrame : number | null = null;
        const loop = () => {
            if (ref.current) {
                render({
                    canvas: ref.current,
                    width,
                    height,
                    onionSkin,
                    uiMode,
                    layers,
                    layerOrder,
                    boxesVisible
                });
            }
            animationFrame = requestAnimationFrame(loop);
        }
        animationFrame = requestAnimationFrame(loop);
        return () => {
            if (animationFrame !== null) {
                cancelAnimationFrame(animationFrame);
            }
        };
    },[ref.current, width, height, onionSkin, layers, layerOrder,boxesVisible,uiMode]);

    useEffect(() => {
      if (!ref.current) return;
      const onPointerDown = (event: PointerEvent) => {
        setPointerDown(true);
        setStart(true);
      };
      const onPointerUp = (event: PointerEvent) => {
        setPointerDown(false);
      }
      const onPointerMove = (event: PointerEvent) => {
        event.preventDefault();

        if (!ref.current) return;
        if (pointerDown && currentLayer) {
          const x = (event.offsetX / ref.current.offsetWidth) * Dimensions.width;
          const y = event.offsetY / ref.current.offsetHeight * Dimensions.height;
          projectPointerToCanvas({
            currentTool,
            currentColor,
            brushSize,
            layers,
            currentLayer,
            x,
            y,
            start
          });
        };
        if (start) {
          setStart(false);
        }
      };
      ref.current.addEventListener("pointerdown", onPointerDown);
      ref.current.addEventListener("pointerup", onPointerUp);
      ref.current.addEventListener("pointermove", onPointerMove);
      return () => {
        if (!ref.current) return;
        ref.current.removeEventListener("pointerdown", onPointerDown);
        ref.current.removeEventListener("pointerup", onPointerUp);
        ref.current.removeEventListener("pointermove", onPointerMove);
      }
    }, [ref.current, currentLayer, pointerDown, currentTool, currentColor, brushSize, layers,start]);





  return <div style={{
    height: "100%",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
    
  }}>
    <canvas style={{
      height: "100%",
      backgroundColor: "white",
      border: "1px solid black"
    }} 
      width={width} height={height} ref={ref}/>
  </div>;
}

export default DrawingCanvas;