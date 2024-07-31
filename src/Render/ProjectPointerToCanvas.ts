import type { ProjectionProps } from '../Types/Types';
import { applyInvertedLayerTransformation } from './ApplyLayerTransformation';

function projectPointerToCanvas(props : ProjectionProps) {
    const layer = props.layers[props.currentLayer];
    const { anchorPoint, frames, currentFrame, name } = layer;

    const r = window.PINS_AND_CURVES_RECEIVER;
    if (!r) {
        return;
    }
    
    const resources = window.RECEIVER_RESOURCES;
    if (!resources) {
        return;
    }

    if (currentFrame === undefined) {
        return;
    }
    const ctx = resources[frames[currentFrame].canvasId].context;
    if (!ctx) {
        return;
    }

    // Get the layer's properties
    const positionX = r.getSignal(name, 'positionX',0);
    const positionY = r.getSignal(name, 'positionY',0);
    const scaleX = r.getSignal(name, 'scaleX',1);
    const scaleY = r.getSignal(name, 'scaleY',1);
    const rotation = r.getSignal(name, 'rotation',0) * (1/360) * 2 * Math.PI;
    const [anchorX, anchorY] = anchorPoint;


    // Project the pointer to the layer's canvas
    let [x,y] = applyInvertedLayerTransformation(props.x,props.y, {
        translateX: positionX,
        translateY: positionY,
        rotate: rotation,
        scaleX: scaleX,
        scaleY: scaleY,
        anchorX: anchorX,
        anchorY: anchorY,
    })


    if (props.currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = props.currentColor;
    }

    // Draw the pointer
    ctx.strokeStyle = props.currentColor;
    ctx.lineWidth = props.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    //console.log(props.start, props.currentColor, props.brushSize);
    if (props.start) {
        ctx.beginPath();
        ctx.moveTo(x,y);
    }
    ctx.lineTo(x,y);
    ctx.stroke();



}

export default projectPointerToCanvas;