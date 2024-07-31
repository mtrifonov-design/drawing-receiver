import { generateId } from "../Utils/Utils";
import Dimensions from "../Constants/Dimensions";
import type { Frame } from "../Types/Types";

function createFrame() {
    const canvasId = generateId();
    const canvas = document.createElement("canvas");
    canvas.width = Dimensions.width;
    canvas.height = Dimensions.height;
    const ctx = canvas.getContext("2d");
    if (window.RECEIVER_RESOURCES && ctx) {
        window.RECEIVER_RESOURCES[canvasId] = {canvas, context:ctx};
    } else {
        throw new Error("RECEIVER_RESOURCES not defined, or ctx is null");
    }
    return {
        canvasId,
    }
}

const copyFrame = (frame : Frame) => {
    const newFrame = createFrame();
    const canvas = window.RECEIVER_RESOURCES[frame.canvasId].canvas;
    const ctx = window.RECEIVER_RESOURCES[newFrame.canvasId].context;
    ctx.drawImage(canvas, 0, 0);
    return newFrame;
}

export { createFrame, copyFrame };