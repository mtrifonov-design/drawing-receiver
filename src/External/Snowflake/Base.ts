interface NodeMap {
    [id: string]: string;
}

interface EdgeMap {
    [id: string]: string;
}

function syncNodes(nodes : NodeMap,edges : EdgeMap,nodeA_id : string,nodeB_id : string) {
    const nodeAState = nodes[nodeA_id];
    const nodeBState = nodes[nodeB_id];
    const edgeState = edges[nodeA_id+"->"+nodeB_id];

    const nodeATainted = nodeAState !== edgeState;
    const nodeBTainted = nodeBState !== edgeState;

    if (nodeBTainted) {
        if (nodeBState === undefined) {
            delete nodes[nodeA_id]
            delete edges[nodeA_id+"->"+nodeB_id];
            return;
        }
        nodes[nodeA_id] = nodeBState;
        edges[nodeA_id+"->"+nodeB_id] = nodeBState;
        return;
    } else if (nodeATainted) {
        if (nodeAState === undefined) {
            delete nodes[nodeB_id]
            delete edges[nodeA_id+"->"+nodeB_id];
            return;
        }
        nodes[nodeB_id] = nodeAState;
        edges[nodeA_id+"->"+nodeB_id] = nodeAState;
        return;
    }
    return;
}

function generateID() {
    return Math.random().toString(10).substring(2) + (new Date()).getTime().toString(10);
}

function updateNode(nodes : NodeMap,node_id : string) : string {
    const newState = generateID();
    nodes[node_id] = newState;
    return newState
}

function deleteNode(nodes : NodeMap,node_id : string) {
    delete nodes[node_id];
}

// function createNode(nodes : NodeMap) {
//     let nodeId = generateID();
//     nodes[nodeId] = generateID();
//     return;
// }

export type {NodeMap,EdgeMap};
export {syncNodes,generateID,updateNode,deleteNode};

