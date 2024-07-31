
// import parseToJSFunction from "./YevaScript/parseToJSFunction";
// import {clamp} from "../UI/Utils/utils";

// const DEFAULT_CACHED = parseToJSFunction({},`->0;`);

// const locatePreviousKeyframe = (keyframeId,keyframeTimes) => {
//     const sortedKeyframeTimes = Object.entries(keyframeTimes).sort((a,b) => a[1] - b[1]);
//     sortedKeyframeTimes.unshift(["startKeyframe",0]);
//     const currentKeyframeIndex = sortedKeyframeTimes.findIndex(([id,kftime]) => id === keyframeId)
//     return sortedKeyframeTimes[currentKeyframeIndex-1][0];
// }



// const locateRelevantKeyframeData = (absoluteTime,keyframeTimes,keyframeValues,keyframeInterpolationFunctions) => {
//     const sortedKeyframeTimes = Object.entries(keyframeTimes).sort((a,b) => a[1] - b[1]);

//     if (sortedKeyframeTimes.length === 0) {
//         sortedKeyframeTimes.push(["startKeyframe",0]);
//         sortedKeyframeTimes.push(["endKeyframe",1]);
//     } 
//     if (sortedKeyframeTimes[0][1] !== 0) {
//         sortedKeyframeTimes.unshift(["startKeyframe",0]);
//     } 
//     if (sortedKeyframeTimes[sortedKeyframeTimes.length-1][1] !== 1) {
//         sortedKeyframeTimes.push(["endKeyframe",1]);
//     }

//     let currentKeyframeId = sortedKeyframeTimes[0][0];
//     let previousKeyframeId = sortedKeyframeTimes[0][0];
//     for (let i = 0; i < sortedKeyframeTimes.length-2; i++) {
//         const [id1,time1] = sortedKeyframeTimes[i];
//         const [id2,time2] = sortedKeyframeTimes[i+1];
//         if (time1 < absoluteTime && absoluteTime <= time2) {
//             currentKeyframeId = id2;
//             previousKeyframeId = id1;
//         }
//     }

//     keyframeValues["startKeyframe"] = 0;
//     keyframeValues["endKeyframe"] = 0;
//     keyframeInterpolationFunctions["endKeyframe"] = {
//         cached: DEFAULT_CACHED,
//     };    
//     keyframeInterpolationFunctions["startKeyframe"] = {
//         cached: DEFAULT_CACHED,
//     };    
//     const currentKeyframe = {
//         time: keyframeTimes[currentKeyframeId],
//         value: keyframeValues[currentKeyframeId],
//     }
//     const previousKeyframe = {
//         time: keyframeTimes[previousKeyframeId],
//         value: keyframeValues[previousKeyframeId],
//     }
//     const interpolationFunction = keyframeInterpolationFunctions[currentKeyframeId] 
//     //console.log(currentKeyframeId,interpolationFunction);

//     return {
//         currentKeyframe,
//         previousKeyframe,
//         currentKeyframeId,
//         interpolationFunction,
//     }
// };

// const cachedInterpolationFunctions = {

// };

// const getCached = (trackId,keyframeId,interpolationFunction,ACCESSIBLE_EXTERNAL_SCOPE_SCHEMA) => {
//     const result = cachedInterpolationFunctions[`${trackId}-${keyframeId}`];
//     //console.log("DECIDING CACHE",interpolationFunction,result);
//     if (result === undefined || result.functionString !== interpolationFunction.functionString) {
//         console.log("Caching new function");
//         const functionString = interpolationFunction.functionString;
//         const error = interpolationFunction.error;
//         let cachedFunction;
//         if (error === "") {cachedFunction = parseToJSFunction(ACCESSIBLE_EXTERNAL_SCOPE_SCHEMA, functionString)}
//         else {cachedFunction = parseToJSFunction(ACCESSIBLE_EXTERNAL_SCOPE_SCHEMA, "-> 0;"); };
//         const cachedObject = {
//             functionString: functionString,
//             cached: cachedFunction,
//         }
//         cachedInterpolationFunctions[`${trackId}-${keyframeId}`] = cachedObject;
//         return cachedFunction;
//     }
//     else {
//         return result.cached;
//     }
// }

// const interpolateKeyframeValue = ({absoluteTime,tracks,trackId},visitedTracks) => {
//     if (visitedTracks === undefined) visitedTracks = [];
//     if (visitedTracks.includes(trackId)) {
//         throw new Error("Circular reference detected");
//     } else {
//         visitedTracks.push(trackId);
//     }

//     let {pinTimes,pinValues,curves} = tracks[trackId];
//     let keyframeTimes = {...pinTimes}
//     let keyframeValues = {...pinValues}
//     let keyframeInterpolationFunctions = {...curves}
//     const relevantKeyframeData = locateRelevantKeyframeData(absoluteTime,keyframeTimes,keyframeValues,keyframeInterpolationFunctions);


//     const cachedFunction = getCached(trackId,relevantKeyframeData.currentKeyframeId,relevantKeyframeData.interpolationFunction,accesibleExternalScope);
//     const interpolatedValue = cachedFunction(accesibleExternalScope.functions,accesibleExternalScope.variables,{tracks,trackId,visitedTracks})
//     return isNaN(interpolatedValue) ? 0 : clamp(interpolatedValue,0,1);
// }

// export {locatePreviousKeyframe};
// export default interpolateKeyframeValue;