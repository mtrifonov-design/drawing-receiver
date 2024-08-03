interface Frame {
    canvasId: string;
}

interface Layer {
    name: string;
    visible: boolean;
    anchorPoint: [number,number];
    blendMode: string;
    frames: Frame[];
    currentFrame: number | undefined;
    id: string;
}

interface LayerCollection {
    [key: string]: Layer;
}

interface RenderProps {
    canvas: HTMLCanvasElement | null;
    width: number;
    height: number;
    onionSkin: boolean;
    layers: any;
    layerOrder: string[];
    boxesVisible: boolean;
    uiMode: string;
}

interface ProjectionProps {
    currentTool: string;
    currentColor: string;
    brushSize: number;
    layers: LayerCollection;
    currentLayer: string;
    x: number;
    y: number;
    start: boolean;
}

export { Frame, Layer, LayerCollection, RenderProps, ProjectionProps };