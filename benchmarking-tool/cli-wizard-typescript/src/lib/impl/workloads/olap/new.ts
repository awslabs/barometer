import { IOLAPWorkloadConfiguration, IOLAPWorkloadSettings } from "../../../interface/workloads/olap/new";
import { WorkloadConfiguration } from "../../workload";

const WORKLOAD_TYPE = "olap";
export class OLAPWorkloadConfiguration extends WorkloadConfiguration implements IOLAPWorkloadConfiguration {
    settings!: OLAPWorkloadSettings;
    constructor() {
        super();
        this.workloadType = WORKLOAD_TYPE;
    }
}

export class OLAPWorkloadSettings implements IOLAPWorkloadSettings {
    dataset!: string;
    loadMethod!: string;
    usePartitioning!: boolean;
    scalingFactor!: number;
}
