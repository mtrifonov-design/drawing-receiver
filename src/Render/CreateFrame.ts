import { generateId } from "../Utils/Utils";
import Dimensions from "../Constants/Dimensions";

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

export { createFrame };