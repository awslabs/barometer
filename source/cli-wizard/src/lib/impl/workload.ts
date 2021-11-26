import {ConfigurationType} from '../interface/configuration';
import {ConfigurationItem} from "./configuration";
import {IWorkloadSettings, IScriptPath, IVolume, IWorkloadConfiguration} from "../interface/workload";

export class WorkloadConfiguration extends ConfigurationItem implements IWorkloadConfiguration {
    settings!: WorkloadSettings;

    constructor() {
        super();
        this.configType = ConfigurationType.WORKLOAD;
    }
}

export class WorkloadSettings implements IWorkloadSettings {
    volume!: Volume;
    supportedPlatforms!: Array<string>;
    ddl!: { [p: string]: ScriptPath } | ScriptPath;
    queries!: { [p: string]: ScriptPath } | ScriptPath;
    description!: string;
    name!: string;
    workloadType!: string;
}

export class Volume implements IVolume {
    name!: string;
    path!: string;
    format!: string;
    compression?: string;
    delimiter?: string;
}

export class ScriptPath implements IScriptPath {
    path!: string;
}
