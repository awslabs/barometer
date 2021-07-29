import { WorkloadType } from '../../../interface/workload';
import { IOLAPWorkloadConfiguration, IOLAPWorkloadSettings } from "../../../interface/workloads/olap/new";
import { WorkloadConfiguration } from "../../workload";

export class OLAPWorkloadConfiguration extends WorkloadConfiguration implements IOLAPWorkloadConfiguration {
    settings!: OLAPWorkloadSettings;
    constructor() {
        super();
        this.workloadType = WorkloadType.OLAP;
    }
}

export class OLAPWorkloadSettings implements IOLAPWorkloadSettings {
    dataset!: string;
    loadMethod!: string;
    usePartitioning!: boolean;
    scalingFactor!: number;
}
