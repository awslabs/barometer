import { IWorkloadConfiguration } from "../interface/workload";
import { ConfigurationItem } from "./configuration";

const CONFIG_TYPE = "workloads";
export class WorkloadConfiguration extends ConfigurationItem implements IWorkloadConfiguration {
    workloadType!: string;

    constructor() {
        super();
        this.configType = CONFIG_TYPE;
    }
}