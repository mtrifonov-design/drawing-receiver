import { StateTimeWorm } from '../StateTimeWorm/Interfaces';


interface Curve {
    error: string,
    functionString: string,
};
interface Signal {
    pinIds: string[], // order matters!
    pinTimes: {
        [pinId: string]:number,
    };
    pinValues: {
        [pinId: string]: number,
    };
    curves: {
        [pinId: string]: Curve, 
    };
    range: [number, number],
};

interface SignalData { 
    [signalId: string]: Signal,
};

type FolderColor = "red" | "green" | "blue" | "pink" | "orange" | "cyan";

interface OrgData {
    openFolder: string | undefined,
    signalIds: string[],
    folderIds: string[],
    folderColors: {
        [folderId: string]: FolderColor,
    },
    signalMetadata: {
        [signalId: string]: string,
    },
    folderMetadata: {
        [folderId: string]: string,
    },
    signalNames: {
        [signalId: string] : string,
    },
    folderNames: {
        [folderId: string] : string,
    },
    parentFolders: {
        [signalId: string] : string,
    },
    activeSignalIds: string[],
    folderContents: {
        [folderId: string]: {
            signalIds: string[],
        }
    }
}

interface ConfigData {
    receiverAddress: string,
    domain: {
        loopInterval: [number, number],
        unitMode: "standard" | "seconds",
        steps: number,
        unitsPerSecond: number,
    },

};

interface ProjectState {
    org: OrgData,
    signalData: SignalData,
    configData: ConfigData,
};


interface InternalProjectState {
    editCursor: string | undefined,
    commitCursor: string | undefined,
}

interface DataState {
    projectWorm: StateTimeWorm,
    projectState: ProjectState,
    cachedProjectState: ProjectState,
    internalProjectState: InternalProjectState,

}

interface ProjectFile {
    projectWorm : StateTimeWorm,
    projectState: ProjectState,
    internalProjectState: InternalProjectState,
}

interface ExportedProjectFile {
    projectWorm : StateTimeWorm,
    projectState: ProjectState,

}

interface ProjectOnlineMetadata {
    name: string,
}

interface BroadcastAPI {
    broadcastWormCommands: (message: any) => void,

}

export type { SignalData, FolderColor, ProjectFile, ExportedProjectFile, DataState, ProjectState, Signal, Curve, InternalProjectState, BroadcastAPI, ProjectOnlineMetadata }