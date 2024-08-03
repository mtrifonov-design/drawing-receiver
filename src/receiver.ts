import type { WormCommand } from "./External/StateTimeWorm/Interfaces";
import StateTimeWormManager, {executeCommand} from "./External/StateTimeWorm/stateTimeWormManager";
import type { StateTimeWorm } from "./External/StateTimeWorm/Interfaces";
import type { ProjectState } from "./External/Types/Project";
import produceNextProjectDataState from "./External/ProduceNextProjectDataState/produceNextProjectDataState";
import interpolateSignalValue from "./External/InterpolateSignalValue/interpolateSignalValue";

const structuredClone = (obj : any) => {
    return JSON.parse(JSON.stringify(obj));
}

class Receiver {
    projectWorm: undefined | StateTimeWorm;
    projectState: undefined | ProjectState;
    cachedProjectState: undefined | ProjectState;
    editCursor: undefined | string;
    commitCursor: undefined | string;
    projectReady: boolean = false;
    position: undefined | number;
    cachedCurves : {[a: string] : any} = {};
    preview: boolean = true;
    previewSubscribers : any[] = [];
    constructor() {
        this.__requestProject();
        window.addEventListener('message', (event) => {
            //console.log("message received")
            this.__handleUpdate(event.data)
        });

    };
    subscribeToPreview(callback : any) {
        this.previewSubscribers.push(callback);
    }
    unsubscribeFromPreview(callback : any) {
        this.previewSubscribers = this.previewSubscribers.filter((subscriber) => subscriber !== callback);
    }

    __requestProject() {
        window.parent.postMessage({type: 'requestProject'}, '*');
    };
    __handleProject(data :any) {
        const project = data.exportedProjectFile;
        const uiData = data.uiData;

        this.position = uiData.position;

        console.log(project)
        this.projectWorm = project.projectWorm;
        this.projectState = project.projectState;
        this.cachedProjectState = structuredClone(project.projectState);
        this.editCursor = StateTimeWormManager.getCursor(this.projectWorm,"EDIT");
        this.commitCursor = StateTimeWormManager.getCursor(this.projectWorm,"COMMIT");
        this.projectReady = true;
    };
    __handleUpdate(update : any) {
        //console.log(update)
        if (update.type === 'project') {
            this.__handleProject(update.payload);
        } else if (this.projectReady && update.type === 'WormCommands') {
            this.__handleWormCommands(update.payload);
        } else if (this.projectReady && update.type === 'UiDataUpdate') {
            this.__handleUiDataUpdate(update.payload);
        }
    };
    __handleUiDataUpdate(uiData : any) {
        if (uiData.position !== undefined) this.position = uiData.position;
        if (uiData.preview !== undefined) {
            //console.log("Preview is",uiData.preview)
            this.preview = uiData.preview;
            this.previewSubscribers.forEach((subscriber) => subscriber());
        };
    };
    __handleWormCommands(wormCommands : WormCommand[]) {
        let wormState : StateTimeWorm = this.projectWorm!;
        let projectState = this.projectState;
        let cachedProjectState = this.cachedProjectState;
        let localEditCursor = this.editCursor!;
        let localCommitCursor = this.commitCursor!;

        wormCommands.forEach((command) => {
            wormState = executeCommand(wormState, command)!;
            const newEditCursor = StateTimeWormManager.getCursor(wormState,"EDIT");
            const newCommitCursor = StateTimeWormManager.getCursor(wormState,"COMMIT");
            if (newEditCursor === localCommitCursor) {
                projectState = structuredClone(cachedProjectState);
            } else {
                const instructions = StateTimeWormManager.getInstructions(wormState, localEditCursor, newEditCursor);
                for (let i = 0; i < instructions.length; i++) {
                    const instruction = instructions[i];
                    //console.log("bfore",JSON.stringify(projectState))
                    projectState = produceNextProjectDataState(projectState, instruction);
                    //console.log("fter",JSON.stringify(projectState))
                }
            }
            if (newCommitCursor !== localCommitCursor) {
                cachedProjectState = structuredClone(projectState);
            }
            localEditCursor = newEditCursor;
            localCommitCursor = newCommitCursor;
            
        })
        //console.log("Project State is",projectState)
        this.cachedProjectState = cachedProjectState;
        this.projectState = projectState;
        this.projectWorm = wormState;
        this.editCursor = localEditCursor;
        this.commitCursor = localCommitCursor;
    };

    get isPreview() : boolean {
        return this.preview; 
    }

    get playhead() : number {
        return this.getPlayhead();
    }

    getPlayhead() : number {
        if (this.projectReady === true) {
            if (this.position !== undefined) return this.position;
            return 0;            
        } else {
            return 0;
        }
    }

    getSignal(folderName: string, signalName: string, default_value: number , time: number | undefined = undefined) {
        if (time === undefined) {
            time = this.playhead
        }
        if (this.projectState === undefined) {
            return default_value;
        }
        const folderId = this.projectState.org.folderIds.find((id) => this.projectState!.org.folderNames[id] === folderName);
        if (folderId === undefined) {
            return default_value;
        }
        const signalId = this.findSignalId(folderId, signalName);
        if (signalId === undefined) {
            return default_value;
        }
        return this.getSignalAtTime(signalId, time);
    }

    getSignalAtTime(id : string,time:number) {
        //console.log("Our project state is",this.projectState.signalData["signal1"].pinTimes["pin1"])
        if (this.projectState === undefined) {
            // console.log("Project State not loaded")
            return 0
        }
        if (this.projectState.signalData[id] === undefined) {
            // console.log("Signal not found")
            return 0
        }
        
        
        const tracks = this.projectState!.signalData;
        const interpolatedValue =  interpolateSignalValue(tracks,id,time)
        if (interpolatedValue === undefined) {return 0}
        return interpolatedValue;

    };

    getSignalNames() {
        if (this.projectState === undefined) {
            return [];
        }
        const ids = Object.keys(this.projectState.signalData);
        const names = ids.map((id) => this.projectState!.org.signalNames[id]);
        return names;
    }

    findSignalId(folderId : string,signalName : string) {
        const signalId = this.projectState!.org.folderContents[folderId].signalIds.find((id) => this.projectState!.org.signalNames[id] === signalName);
        return signalId;
    };
    getSignalValue(signalId : string) {
        return 1;
    }
}

export default Receiver;