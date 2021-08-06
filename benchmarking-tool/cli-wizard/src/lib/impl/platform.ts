import { ConfigurationType } from '../interface/configuration';
import { IPlatformConfiguration, PlatformType } from "../interface/platform";
import { WorkloadType } from '../interface/workload';
import { ConfigurationItem } from "./configuration";

export class PlatformConfiguration extends ConfigurationItem implements IPlatformConfiguration {
  platformType!: PlatformType;
  workloadType!: Array<WorkloadType>;

  constructor() {
    super();
    this.configType = ConfigurationType.PLATFORM;
  }
}