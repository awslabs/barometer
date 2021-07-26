
import { IOLTPWorkloadConfiguration, IOLTPWorkloadSettings } from "../../../interface/workloads/oltp/new";
import { WorkloadConfiguration } from "../../workload";

const WORKLOAD_TYPE = "oltp";
export class OLTPWorkloadConfiguration extends WorkloadConfiguration implements IOLTPWorkloadConfiguration {
    settings!: OLTPWorkloadSettings;
    constructor() {
        super();
        this.workloadType = WORKLOAD_TYPE;
    }
}

export class OLTPWorkloadSettings implements IOLTPWorkloadSettings {
    dataset!: string;
    scalingFactor!: number;
}
