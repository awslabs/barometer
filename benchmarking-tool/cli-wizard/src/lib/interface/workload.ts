import {IConfigurationItem} from './configuration';


export interface IWorkloadConfiguration extends IConfigurationItem {
    settings: IWorkloadSettings;
}

export interface IWorkloadSettings {
    name: string;
    description: string;
    workloadType: string;
    volume: IVolume;
    loadMethod: string;
    ddl: { [p: string]: IScriptPath } | IScriptPath;
    queries: { [p: string]: IScriptPath } | IScriptPath;
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