import { ConfigurationType } from '../interface/configuration';
import { IWorkloadConfiguration, WorkloadType } from "../interface/workload";
import { ConfigurationItem } from "./configuration";

export class WorkloadConfiguration extends ConfigurationItem implements IWorkloadConfiguration {
    workloadType!: WorkloadType;

    constructor() {
        super();
        this.configType = ConfigurationType.WORKLOAD;
    }
}