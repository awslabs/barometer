import { IWorkloadConfiguration } from "../../workload";

export interface IOLAPWorkloadConfiguration extends IWorkloadConfiguration {
    settings: IOLAPWorkloadSettings;
}

export interface IOLAPWorkloadSettings {
    scalingFactor: number;
    loadMethod: string;
    usePartitioning: boolean;
}
