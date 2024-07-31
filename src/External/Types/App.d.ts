interface DataServer {
    get: (resourceId: string) => Promise<any>,
    set: (resourceId: string, value: any) => Promise<void>,
}

interface MetadataServer {
    runTransaction: (transaction: any) => Promise<any>,
    getMetadata: () => Promise<any>,
}

interface LocalStorage {
    get: (key: string) => Promise<any>,
    set: (key: string, value: any) => Promise<void>,
    remove: (key: string) => Promise<void>,
}

interface ExternalApis {
    dataServer: DataServer,
    metadataServer: MetadataServer,
    localStorage: LocalStorage,
}


interface ResourceMetadata {
    state: string,
    timestamp: number,
    payload: any,
}

type TransactionFunction = (
    getRemoteResourceMetadata : (resourceId: string) => Promise<any>,
    setRemoteResource: (resourceId: string, resourceMetadata: ResourceMetadata) => Promise<void>) 
    => Promise<any>;

// request keys generally work APPINSTANCEID-NAMESPACE-KEY
interface App {
    localStorage: {
        get: (namespace: string, key: string) => Promise<any>,
        set: (namespace: string, key: string, value: any) => Promise<void>,
        removeAll: () => Promise<void>,
    },
    dataServer: {
        get: (resourceId: string) => Promise<any>,
        set: (resourceId: string, value: any) => Promise<void>,
    },
    metadataServer: {
        runTransaction: (transaction: any) => Promise<any>,
        getMetadata: () => Promise<any>,
    }
    instanceId: string,
}

export type {ExternalApis, App, DataServer, MetadataServer, LocalStorage, TransactionFunction, ResourceMetadata}