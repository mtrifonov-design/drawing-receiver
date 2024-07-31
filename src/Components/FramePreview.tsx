import React, { useEffect } from "react";
import useAppState from "../Hooks/useAppState";

function FramePreview({ frameIndex, currentLayer }: { frameIndex: number, currentLayer: string }) {
    const frame = useAppState((state: any) => state.layers[currentLayer].frames[frameIndex]);

    const ref = React.useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        let animationFrame: number | null = null;
        const loop = () => {
            if (ref.current) {
                const ctx = ref.current.getContext("2d");
                const resources = window.RECEIVER_RESOURCES;
                if (!resources) {
                    return;
                }
                const canvasId = frame.canvasId;
                const canvas = resources[canvasId].canvas;
                if (ctx) {
                    ctx.clearRect(0, 0, 100, 100);
                    ctx.drawImage(canvas, 0, 0, 50, 50);
                }
            }
            animationFrame = requestAnimationFrame(loop);
        }
        animationFrame = requestAnimationFrame(loop);

        return () => {
            if (animationFrame !== null) {
                cancelAnimationFrame(animationFrame);
            }
        };
    })

    return <canvas style={{
            border: "1px solid black",
            backgroundColor: "white",
        }} width={50} height={50} ref={ref} />;
}

export default FramePreview;