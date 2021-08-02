import { IConfigurationItem } from './configuration';
import { IPlatformConfiguration, PlatformType } from './platform';
import { IWorkloadConfiguration, WorkloadType } from './workload';

export enum ExecutionMode {
  SEQUENTIAL = "sequential",
  CONCURRENT = "concurrent",
}

export interface IExperimentConfiguration extends IConfigurationItem {
  experimentType: string;

  workloadType: WorkloadType;
  platformType: PlatformType;

  settings: IExperimentSettings;
}

export interface IExperimentSettings {
  workloadConfig: IWorkloadConfiguration;
  platformConfig: IPlatformConfiguration;

  executionMode: ExecutionMode;
  concurrentSessionCount: number;
  keepInfrastructure: boolean;
}
