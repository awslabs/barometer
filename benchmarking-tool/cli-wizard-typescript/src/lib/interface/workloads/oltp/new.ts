import { IWorkloadConfiguration } from "../../workload";

export interface IOLTPWorkloadConfiguration extends IWorkloadConfiguration {
    settings: IOLTPWorkloadSettings;
}

export interface IOLTPWorkloadSettings {
    dataset: string;
    scalingFactor: number;
}