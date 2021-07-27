
import { WorkloadType } from '../../../interface/workload';
import { IOLTPWorkloadConfiguration, IOLTPWorkloadSettings } from "../../../interface/workloads/oltp/new";
import { WorkloadConfiguration } from "../../workload";

export class OLTPWorkloadConfiguration extends WorkloadConfiguration implements IOLTPWorkloadConfiguration {
    settings!: OLTPWorkloadSettings;
    constructor() {
        super();
        this.workloadType = WorkloadType.OLTP;
    }
}

export class OLTPWorkloadSettings implements IOLTPWorkloadSettings {
    dataset!: string;
    scalingFactor!: number;
}
