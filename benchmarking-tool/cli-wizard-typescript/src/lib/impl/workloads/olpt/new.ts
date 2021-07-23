import { IOLAPWorkloadConfiguration, IOLAPWorkloadSettings } from "../../../interface/workloads/olap/new";
import { WorkloadConfiguration } from "../../workload";

export class OLAPWorkloadConfiguration extends WorkloadConfiguration implements IOLAPWorkloadConfiguration{
    settings!: OLAPWorkloadSettings;
}

export class OLAPWorkloadSettings implements IOLAPWorkloadSettings{
    loadMethod!: string;
    usePartitioning!: boolean;
    scalingFactor!: number;
}
