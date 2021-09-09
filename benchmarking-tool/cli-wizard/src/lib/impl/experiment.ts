import {ConfigurationType} from '../interface/configuration';
import {ExecutionMode, IExperimentConfiguration, IExperimentSettings} from "../interface/experiment";
import {IPlatformConfiguration, PlatformType} from '../interface/platform';
import {IWorkloadConfiguration} from '../interface/workload';
import {ConfigurationItem} from "./configuration";

export class ExperimentConfiguration extends ConfigurationItem implements IExperimentConfiguration {
    experimentType!: string;

    platformType!: PlatformType;

    settings!: ExperimentSettings;

    constructor() {
        super();
        this.configType = ConfigurationType.EXPERIMENT;
    }

}

export class ExperimentSettings implements IExperimentSettings {
    concurrentSessionCount!: number;
    executionMode!: ExecutionMode;
    keepInfrastructure!: boolean;

    workloadConfig!: IWorkloadConfiguration;
    platformConfig!: IPlatformConfiguration;
}
