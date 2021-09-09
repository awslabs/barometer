import {WorkloadType} from '../../../interface/workload';
import {
    IOLAPWorkloadConfiguration,
    IOLAPWorkloadSettings,
    IScriptPath,
    IVolume
} from "../../../interface/workloads/olap/new";
import {WorkloadConfiguration} from "../../workload";

export class OLAPWorkloadConfiguration extends WorkloadConfiguration implements IOLAPWorkloadConfiguration {
    settings!: OLAPWorkloadSettings;

    constructor() {
        super();
        this.workloadType = WorkloadType.OLAP;
    }
}

export class OLAPWorkloadSettings implements IOLAPWorkloadSettings {
    volume!: Volume;
    loadMethod!: string;
    supportedPlatforms!: Array<string>;
    ddl!: { [p: string]: IScriptPath };
    queries!: { [p: string]: IScriptPath };
    description!: string;
    name!: string;
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
