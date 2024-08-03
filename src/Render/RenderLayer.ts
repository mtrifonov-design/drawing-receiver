import type { RenderProps } from '../Types/Types';
import type Receiver from '../receiver';
import { applyLayerTransformation } from './ApplyLayerTransformation';

declare global {
    interface Window {
        RECEIVER_RESOURCES: {
            [key: string]: {
                canvas: HTMLCanvasElement
                context: CanvasRenderingContext2D
            };
        };
        PINS_AND_CURVES_RECEIVER: Receiver;
    }
}

function renderLayer(ctx: CanvasRenderingContext2D, layerId: string, onionSkin: boolean, props: RenderProps) {

    const r = window.PINS_AND_CURVES_RECEIVER;
    if (!r) {
        return;
    }

    const layer = props.layers[layerId];
    const { anchorPoint, frames, currentFrame, name } = layer;

    // Get the layer's properties
    const positionX = r.getSignal(name, 'positionX', 0);
    const positionY = r.getSignal(name, 'positionY', 0);
    const scaleX = r.getSignal(name, 'scaleX', 1);
    const scaleY = r.getSignal(name, 'scaleY', 1);
    const rotation = r.getSignal(name, 'rotation', 0) * (1 / 360) * 2 * Math.PI;
    const anchorX = r.getSignal(name, 'anchorX', 0);
    const anchorY = r.getSignal(name, 'anchorY', 0);
    const currentFrameS = r.getSignal(name, 'currentFrame', 0);
    // Set the layer's transformation matrix
    ctx.save();
    applyLayerTransformation(ctx, {
        translateX: positionX,
        translateY: positionY,
        rotate: rotation,
        scaleX: scaleX,
        scaleY: scaleY,
        anchorX: anchorX,
        anchorY: anchorY,
    });

    // Draw the current frame
    if (props.uiMode === "edit" && currentFrame !== undefined) {
        const frame = frames[currentFrame];
        const { canvasId } = frame;
        const resources = window.RECEIVER_RESOURCES;
        if (!resources) {
            return;
        }
        const canvas = resources[canvasId].canvas as HTMLCanvasElement;
        if (canvas) {
            if (currentFrame > 0 && onionSkin) {
                const prevFrame = frames[currentFrame - 1];
                const prevCanvasId = prevFrame.canvasId;
                const prevCanvas = resources[prevCanvasId].canvas as HTMLCanvasElement;
                if (prevCanvas) {
                    ctx.globalAlpha = 0.5;
                    ctx.drawImage(prevCanvas, 0, 0);
                    ctx.globalAlpha = 1;
                }
            }
            ctx.drawImage(canvas, 0, 0);
            if (props.boxesVisible) {
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1;
                ctx.strokeRect(0, 0, canvas.width, canvas.height);
                // draw anchor point as little cross
                ctx.beginPath();
                ctx.moveTo(anchorX - 5, anchorY);
                ctx.lineTo(anchorX + 5, anchorY);
                ctx.moveTo(anchorX, anchorY - 5);
                ctx.lineTo(anchorX, anchorY + 5);
                ctx.stroke();

            }

        } 

    }
    else {
        const clamped = Math.min(Math.max(currentFrameS, 0), 1);
        const frame = frames[Math.floor(clamped * frames.length)];
        //console.log(clamped, frame);
        const { canvasId } = frame;
        const resources = window.RECEIVER_RESOURCES;
        if (!resources) {
            return;
        }
        const canvas = resources[canvasId].canvas as HTMLCanvasElement;
        if (canvas) {
            ctx.drawImage(canvas, 0, 0);
            if (props.boxesVisible) {
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1;
                ctx.strokeRect(0, 0, canvas.width, canvas.height);
                // draw anchor point as little cross
                ctx.beginPath();
                ctx.moveTo(anchorX - 5, anchorY);
                ctx.lineTo(anchorX + 5, anchorY);
                ctx.moveTo(anchorX, anchorY - 5);
                ctx.lineTo(anchorX, anchorY + 5);
                ctx.stroke();
            }

        }
    }


    // Restore the transformation matrix
    ctx.restore();
}

export default renderLayer;