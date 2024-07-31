import type { ProjectOnlineMetadata } from "./Project";


interface OnlineProjectsRequestResult {
    data: {
        projectId: string,
        metadata: ProjectOnlineMetadata }[],
    signal: "green" | "yellow" | "red",
    message: string,
}

export type { OnlineProjectsRequestResult }