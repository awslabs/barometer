
import { IOLTPWorkloadConfiguration, IOLTPWorkloadSettings } from "../../../interface/workloads/oltp/new";
import { WorkloadConfiguration } from "../../workload";

export class OLTPWorkloadConfiguration extends WorkloadConfiguration implements IOLTPWorkloadConfiguration{
    settings!: OLTPWorkloadSettings;
}

export class OLTPWorkloadSettings implements IOLTPWorkloadSettings{
    scalingFactor!: number;
}
