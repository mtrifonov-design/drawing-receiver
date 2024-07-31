import SnowflakeResourceManager from "./SnowflakeResourceManager";


class MetadataServer {
    private storage: { [key: string]: { remoteResourceState: string, remoteResourceTimestamp: number } } = {};

    async runTransaction(transaction: ((getRemoteResourceMetadata: any, setRemoteResourceData: any) => any)) {
        return await transaction(
            async (resourceId: string) => {
                //console.log(resourceId, this.storage,this.storage[resourceId] || { remoteResourceState: undefined, remoteResourceTimestamp: 0 });
                let result =  this.storage[resourceId] || { remoteResourceState: undefined, remoteResourceTimestamp: 0 }
                //console.log("Result",result)
                return result;
            },
            async (resourceId: string, metadata: { remoteResourceState: string, remoteResourceTimestamp: number }) => {
                this.storage[resourceId] = metadata;
            }
        );
    }
}

class DataServer {
    private storage: { [key: string]: { state: string, data: any} } = {};

    async getRemoteResourceData(resourceId: string) {
        // data download
        console.log("data download",this.storage[resourceId] || { state: undefined, data: undefined })
        return this.storage[resourceId] || { state: undefined, data: undefined };
    }

    async setRemoteResourceData(resourceId: string, data: any) {
        console.log("data upload",data)
        if (data.state === undefined) {
            delete this.storage[resourceId];
            return;
        }
        this.storage[resourceId] = {
            data: data.data,
            state: data.state,
        };
    }
}

class EditorInstance {
    appData: {
        [key: string]: {
            text: string | undefined;
            tainted: boolean;
        };
    } = {};
    metadataServer: MetadataServer;
    remoteStateRegistry: { [key: string]: string } = {};
    dataServer: DataServer;
    resourceManager: SnowflakeResourceManager;
    private delayTime: { metadataServer: number, dataServer: number } = { metadataServer: 0, dataServer: 0 };
    private responsive: { metadataServer: boolean, dataServer: boolean } = { metadataServer: true, dataServer: true };  

    constructor(metadataServer: MetadataServer, dataServer: DataServer, text?: string) {
        this.metadataServer = metadataServer;
        this.dataServer = dataServer;
        this.resourceManager = new SnowflakeResourceManager({
            runTransaction: this.metadataServerConnectivityLayer(this.metadataServer.runTransaction.bind(this.metadataServer)),
            getLastKnownRemoteState: this.getLastKnownRemoteState.bind(this),
            setLastKnownRemoteState: this.setLastKnownRemoteState.bind(this),
            getRemoteResourceData: this.dataServerConnectivityLayer(this.dataServer.getRemoteResourceData.bind(this.dataServer)),
            setRemoteResourceData: this.dataServerConnectivityLayer(this.dataServer.setRemoteResourceData.bind(this.dataServer))
        });
    }
    private getLastKnownRemoteState(resourceId: string) {
        return this.remoteStateRegistry[resourceId];
    }
    private setLastKnownRemoteState(resourceId: string, state: string | undefined) {
        if (state === undefined) {
            delete this.remoteStateRegistry[resourceId];
            return;
        }
        this.remoteStateRegistry[resourceId] = state;
    }

    setDelay(ms: number, server: "metadataServer" | "dataServer") {
        this.delayTime[server] = ms;
    }

    setUnresponsive(server: "metadataServer" | "dataServer") {
        this.responsive[server] = false;
    }

    setResponsive(server: "metadataServer" | "dataServer") {
        this.responsive[server] = true;
    }


    async simulateDelay(server: "metadataServer" | "dataServer") {
        const serverResponsive = this.responsive[server];
        const delayTime = this.delayTime[server];
        if (!serverResponsive) throw new Error('Editor unresponsive');
        await new Promise(resolve => setTimeout(resolve, delayTime));
    }

    private metadataServerConnectivityLayer(fn: any) {
        return async (...args : any) => {
            await this.simulateDelay("metadataServer");
            return await fn(...args);
        }
    }

    private dataServerConnectivityLayer(fn: any) {
        return async (...args : any) => {
            await this.simulateDelay("dataServer");
            return await fn(...args);
        }
    }

    private resourceTainted(resourceId: string) {
        return this.appData[resourceId] !== undefined && this.appData[resourceId].tainted;
    }

    create(resourceId: string, text: string) {
        if (this.appData[resourceId] !== undefined) {
            throw new Error('Resource already exists');
        }
        this.appData[resourceId] = { text: text, tainted: true};
    }

    edit(resourceId: string, text: string) {
        if (this.appData[resourceId] === undefined) {
            throw new Error('Not loaded');
        } else {
            this.appData[resourceId].text = text;
            this.appData[resourceId].tainted = true;
        }
    }

    delete(resourceId: string) {
        if (this.appData[resourceId] === undefined) {
            throw new Error('Not loaded');
        }
        this.appData[resourceId].text = undefined;
        this.appData[resourceId].tainted = true;
    }

    get(resourceId: string) {
        if (this.appData[resourceId] === undefined) {
            throw new Error('Not loaded');
        } else {
            return this.appData[resourceId].text;
        }
    }

    async syncWrite(resourceId : string, withOverwrite: boolean = false) {
        const data = this.get(resourceId);
        return await this.resourceManager.setResource(resourceId, data, withOverwrite);
    }

    private async syncRead(resourceId: string) {
        return await this.resourceManager.getResource(resourceId);
    }

    async sync(resourceId: string) : Promise<"green" | "yellow" | "red"> {
        if (this.resourceTainted(resourceId)) {
            const {data,signal,message} = await this.syncWrite(resourceId);
            if (signal === 'green') {
                this.appData[resourceId].tainted = false;
                return signal;
            } 
            console.log(message);
            return signal;
        } else {
            const {data,signal,message} = await this.syncRead(resourceId);
            console.log(data,signal,message);
            console.log("Data is", data);
            if (signal === 'green') {
                if (this.appData[resourceId] === undefined) {
                    this.appData[resourceId] = { text: data, tainted: false};
                    return signal;
                }
                this.appData[resourceId].text = data;
                return signal;
            }
            return signal;
        }
        
    }
}



export { MetadataServer, DataServer, EditorInstance}