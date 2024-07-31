import {syncNodes,generateID,updateNode,deleteNode} from "./Base";
import type {NodeMap,EdgeMap} from "./Base";

interface NodeMetadata {
    type: string;
    payload: any;
}

interface NodeMetadataMap {
    [id: string]: NodeMetadata;
}

interface ExternalAPI {
    getParentNodes(): Promise<NodeContent>;
    setParentNodes(nodes: NodeContent): Promise<boolean>;
}

interface SyncFeedback {
    status: boolean;
    syncFeedbacks: AtomicSyncFeedback[];
}

interface NodeContent {
    states: NodeMap;
    metadata: NodeMetadataMap;

}

interface AtomicSyncFeedback {
    updated: boolean;
    rejected: boolean;
    resourceId: string;
}

interface SnowflakeVertexContent {
    nodes: {
        states: NodeMap,
        metadata: NodeMetadataMap,
    };
    edges: EdgeMap;
}

class SnowflakeVertex {
    content: SnowflakeVertexContent;

    vertexId: string;
    parentVertexId: string;
    externalAPI: ExternalAPI;

    constructor(externalAPI: ExternalAPI, vertexId : string, parentVertexId : string, content: SnowflakeVertexContent | undefined) {
        this.content = content === undefined ?{
            nodes: {
                states: {},
                metadata: {},
            },
            edges: {},
        } : content;
        this.externalAPI = externalAPI;
        this.vertexId = vertexId;
        this.parentVertexId = parentVertexId;
    }

    serializeVertex() {
        return JSON.stringify({
            vertexId: this.vertexId,
            parentVertexId: this.parentVertexId,
            content: this.content,
        });
    }

    static deserializeVertex(serializedVertex: string,externalAPI: ExternalAPI) {
        const {vertexId,parentVertexId,content} = JSON.parse(serializedVertex);
        const vertex = new SnowflakeVertex(externalAPI,vertexId,parentVertexId,content);
        return vertex;
    }

    async sync() : Promise<boolean>{
        try {
            const parentNodes = await this.externalAPI.getParentNodes();
            const combinedNodeStates = {...this.content.nodes.states,...parentNodes.states};
            const combinedNodeMetadata = {...this.content.nodes.metadata,...parentNodes.metadata};
            const edges = {...this.content.edges};
            const combinedResources = [...new Set(Object.keys(combinedNodeStates).map((nodeId : string) => nodeId.split("_")[1]))];

            combinedResources.map(resourceId => this.syncResource(resourceId,{nodes:combinedNodeStates,edges:edges}));
    
            const exportNodesFromVertexId = (vertexId:string) : NodeContent => Object.keys(combinedNodeStates).reduce((acc : NodeContent,nodeId : string) => {
                const [nodeVertexId,resourceId] = nodeId.split("_");
                //console.log(nodeVertexId,vertexId)
                if (nodeVertexId === vertexId) {
                    acc.states[nodeId] = combinedNodeStates[nodeId];
                    acc.metadata[nodeId] = combinedNodeMetadata[nodeId];
                    //acc[nodeId] = combinedNodeStates[nodeId];
                }
                return acc;
            },{states:{},metadata:{}});

            const parentNodesFromVertex : NodeContent = exportNodesFromVertexId(this.parentVertexId);
            //console.log(parentNodesFromVertex)
            await this.externalAPI.setParentNodes(parentNodesFromVertex);
    
            this.content.nodes = exportNodesFromVertexId(this.vertexId);
            this.content.edges = edges;
    
            return true;
        }
        catch (e) {
            console.error(e);
            return false;
        }

    }

    syncResource(resourceId:string,{nodes,edges}:{nodes:NodeMap,edges:EdgeMap}) : AtomicSyncFeedback {
        const nodeA = this.vertexId+"_"+resourceId;
        const nodeB = this.parentVertexId+"_"+resourceId;

        const nodeAStateOld = nodes[nodeA] 
        const nodeBStateOld = nodes[nodeB]
        const edgeStateOld = edges[nodeA+"->"+nodeB] 

        syncNodes(nodes,edges,nodeA,nodeB);

        const nodeAStateNew = nodes[nodeA] 
        const nodeBStateNew = nodes[nodeB] 
        const edgeStateNew = edges[nodeA+"->"+nodeB] 

        // console.log("old",nodeAStateOld,nodeBStateOld,edgeStateOld)
        // console.log("new",nodeAStateNew,nodeBStateNew,edgeStateNew)

        return {
            updated: nodeAStateOld !== nodeAStateNew || nodeBStateOld !== nodeBStateNew || edgeStateOld !== edgeStateNew,
            rejected: nodeAStateOld !== edgeStateOld && nodeAStateOld !== edgeStateNew,
            resourceId: resourceId,
        }
    }

    createResource(resourceId:string,metadata:NodeMetadata) {
        // let resourceId = generateID();
        const newState = updateNode(this.content.nodes.states,this.vertexId+"_"+resourceId);
        this.content.nodes.metadata[this.vertexId+"_"+resourceId] = metadata;
        return newState
    }

    updateResource(resourceId:string) : string {
        return updateNode(this.content.nodes.states,this.vertexId+"_"+resourceId);
    }

    deleteResource(resourceId:string) {
        deleteNode(this.content.nodes.states,this.vertexId+"_"+resourceId);
        delete this.content.nodes.metadata[this.vertexId+"_"+resourceId];
    }

    getResource(resourceId:string) {
        return this.content.nodes.states[this.vertexId+"_"+resourceId];
    }


}


export type {ExternalAPI};
export default SnowflakeVertex;


