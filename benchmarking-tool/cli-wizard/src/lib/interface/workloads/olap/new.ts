import {IWorkloadConfiguration} from "../../workload";

export interface IOLAPWorkloadConfiguration extends IWorkloadConfiguration {
    settings: IOLAPWorkloadSettings;
}

export interface IOLAPWorkloadSettings {
    name: string;
    description: string;
    volume: IVolume;
    loadMethod: string;
    ddl: { [p: string]: IScriptPath };
    queries: { [p: string]: IScriptPath };
    supportedPlatforms: Array<string>;
}

export interface IVolume {
    name: string;
    path: string;
    format: string;
    compression?: string;
    delimiter?: string;
}


export interface IScriptPath {
    path: string;
}