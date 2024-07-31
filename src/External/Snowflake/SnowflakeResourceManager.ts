interface ExternalAPI {
    runTransaction: (transaction: any) => Promise<any>;
    getLastKnownRemoteState: (resourceId: string) => string | undefined;
    setLastKnownRemoteState: (resourceId: string, state: string | undefined) => void;
    getRemoteResourceData: (resourceId: string) => Promise<any>;
    setRemoteResourceData: (resourceId: string, data: any) => Promise<void>;
}

const THRESHOLD = 1000 * 60 * 60 * 1; // 1 hour
function ASSERT(condition: boolean) {
    if (!condition) throw new Error("assertion failed");
}
function generateNewState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

interface SyncFeedback {
    data: any;
    signal: "green" | "yellow" | "red";
    message: string;
}

class SnowflakeResourceManager {

    externalAPI: ExternalAPI;
    constructor(externalAPI: ExternalAPI) {
        this.externalAPI = externalAPI;
    }

    private async obtainPermissionForOverwrite(resourceId: string, metadata: any) : Promise<{permission: boolean, state: string | undefined}> {
        return await this.externalAPI.runTransaction(async (getRemoteResourceMetadata : any ,setRemoteResourceMetadata : any) => {
            let {remoteResourceState,remoteResourceTimestamp} = await getRemoteResourceMetadata(resourceId);
            console.log(remoteResourceState,remoteResourceTimestamp);
            if (Date.now() - remoteResourceTimestamp > THRESHOLD) {
                const newState = generateNewState();
                await setRemoteResourceMetadata(resourceId, {
                    remoteResourceState: newState,
                    remoteResourceTimestamp: Date.now(),
                    remoteResourcePayload: metadata
                });
                return {
                    permission: true,
                    state: newState
                };
            };
            await setRemoteResourceMetadata(resourceId, {
                remoteResourceState: remoteResourceState,
                remoteResourceTimestamp: remoteResourceTimestamp,
                remoteResourcePayload: metadata
            });
            return {
                permission: false,
                state: undefined
            };
        });
    };
    private async obtainPermissionRegular(resourceId: string, metadata: any) : Promise<{permission: boolean, state: string | undefined}> {
        return await this.externalAPI.runTransaction(async (getRemoteResourceMetadata:any,setRemoteResourceMetadata:any) => {
            let {remoteResourceState,remoteResourceTimestamp} = await getRemoteResourceMetadata(resourceId);
            let localResourceState = this.externalAPI.getLastKnownRemoteState(resourceId);
            if (remoteResourceState === localResourceState) {
                const newState = generateNewState();
                await setRemoteResourceMetadata(resourceId, {
                    remoteResourceState: newState,
                    remoteResourceTimestamp: Date.now(),
                    remoteResourcePayload: metadata
                });
                return {
                    permission: true,
                    state: newState
                };
            };
            await setRemoteResourceMetadata(resourceId, {
                remoteResourceState: remoteResourceState,
                remoteResourceTimestamp: remoteResourceTimestamp,
                remoteResourcePayload: metadata
            });
            return {
                permission: false,
                state: undefined
            };
        })
    }

    async setResource(resourceId: string, data: any, overwrite: boolean = false, metadata : any = undefined) : Promise<SyncFeedback> {
        let permissionAndState;
        try {
                if (overwrite === true) {
                    permissionAndState = await this.obtainPermissionForOverwrite(resourceId,metadata);
                    console.log("OVERWRITE TRUE",permissionAndState)
                    if (permissionAndState.permission === false) {
                        return {
                            data: undefined,
                            signal: "yellow",
                            message: "OVERWRITE_REJECTED. TIMESTAMP_THRESHOLD_NOT_MET"
                        };
                    }
                } else {
                    permissionAndState = await this.obtainPermissionRegular(resourceId,metadata);
                    if (permissionAndState.permission === false) {
                        return {
                            data: undefined,
                            signal: "red",
                            message: "WRITE_REJECTED. LOCAL_DATA_INCOMPATIBLE_WITH_SERVER_DATA"
                        };
                    }
                }

        } catch(error) {
            console.error(error)
            return {
                data: undefined,
                signal: "yellow",
                message: "metadata service unavailable"
            };
        }
        let {permission, state} = permissionAndState;
        ASSERT(permission === true);
        this.externalAPI.setLastKnownRemoteState(resourceId, state);
        try {
            await this.externalAPI.setRemoteResourceData(resourceId, {state, data});
            return {
                data: undefined,
                signal: "green",
                message: "data upload successful"
            };
        }
        catch (error) {
            return {
                data: undefined,
                signal: "yellow",
                message: "data upload failed"
            };
        }
    };
    async getResource(resourceId: string) : Promise<SyncFeedback>{
        try {
            const {remoteResourceState,remoteResourceTimestamp,remoteResourcePayload} = await this.externalAPI.runTransaction(async (getRemoteResourceMetadata:any,setRemoteResourceMetadata:any) => {
                const result = await getRemoteResourceMetadata(resourceId);
                return result;
            });
            const localResourceState = this.externalAPI.getLastKnownRemoteState(resourceId);
            if (remoteResourceState === localResourceState) {
                return {
                    data: undefined,
                    signal: "green",
                    message: "data in sync"
                };
            }
            // try to get the data from the remote resource
            try {
                const data = await this.externalAPI.getRemoteResourceData(resourceId);
                if (data.state === remoteResourceState) {
                    return {
                        data: {data:data.data,metadata:remoteResourcePayload},
                        signal: "green",
                        message: "data in sync"
                    };
                }
                return {
                    data: undefined,
                    signal: "yellow",
                    message: "Data can't be found. Consider overwriting"
                };
            } catch (error) {
                return {
                    data: undefined,
                    signal: "yellow",
                    message: "data service unavailable"
                };
            }
        } catch (error) {
            return {
                data: undefined,
                signal: "yellow",
                message: "metadata service unavailable"
            };
        }


    };

}

export type {ExternalAPI,SyncFeedback};
export default SnowflakeResourceManager;

