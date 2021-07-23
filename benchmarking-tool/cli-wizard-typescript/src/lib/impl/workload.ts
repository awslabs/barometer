
import { IWorkloadConfiguration } from "../interface/workload";
import { ConfigurationItem } from "./configuration";

export class WorkloadConfiguration extends ConfigurationItem implements IWorkloadConfiguration {
    workloadType!: string;
}