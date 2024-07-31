

function applyLayerTransformation(ctx: CanvasRenderingContext2D,
    {
        translateX,
        translateY,
        rotate,
        scaleX,
        scaleY,
        anchorX,
        anchorY,
    } : {
        translateX: number,
        translateY: number,
        rotate: number,
        scaleX: number,
        scaleY: number,
        anchorX: number,
        anchorY: number,
    }
) {
    ctx.translate(anchorX, anchorY);
    ctx.scale(scaleX, scaleY);
    ctx.rotate(rotate);
    ctx.translate(-anchorX, -anchorY);
    ctx.translate(translateX, translateY);
}

function applyInvertedLayerTransformation(x:number,y:number,
    {
        translateX,
        translateY,
        rotate,
        scaleX,
        scaleY,
        anchorX,
        anchorY,
    } : {
        translateX: number,
        translateY: number,
        rotate: number,
        scaleX: number,
        scaleY: number,
        anchorX: number,
        anchorY: number,
    }
) {
    const translatePoint = (x : number, y : number, dx : number, dy: number) => {
        return [x + dx, y + dy];
    };
  
    // Apply rotation
    const rotatePoint = (x : number, y : number, rad: number) => {
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        return [
        x * cos - y * sin,
        x * sin + y * cos,
        ];

    };
  
    // Apply scaling
    const scalePoint = (x : number, y : number, scaleX : number, scaleY : number) => {
    return [x * scaleX, y * scaleY];
    };
    // ctx.translate(-translateX, -translateY);
    // ctx.translate(anchorX, anchorY);
    // ctx.rotate(-rotate);
    // ctx.scale(1 / scaleX, 1 / scaleY);
    // ctx.translate(-anchorX, -anchorY);
    const [ax,ay] = translatePoint(x,y,-translateX,-translateY);
    const [bx,by] = translatePoint(ax,ay,anchorX,anchorY);
    const [cx,cy] = rotatePoint(bx,by,-rotate);
    const [dx,dy] = scalePoint(cx,cy,1/scaleX,1/scaleY);
    const [ex,ey] = translatePoint(dx,dy,-anchorX,-anchorY);
    return [ex,ey];

}

export { applyLayerTransformation, applyInvertedLayerTransformation };