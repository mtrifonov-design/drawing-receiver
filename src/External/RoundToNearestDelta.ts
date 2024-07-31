
function roundToNearestDelta(value : number, delta : number) : number {
    return Math.round(value / delta) * delta;
}

export { roundToNearestDelta };