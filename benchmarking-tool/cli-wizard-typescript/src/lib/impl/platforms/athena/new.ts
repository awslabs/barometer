import { IAthenaPlatformConfiguration, IAthenaSettings } from '../../../interface/platforms/athena/new';

import { PlatformType } from '../../../interface/platform';
import { PlatformConfiguration } from '../../platform';
import { WorkloadType } from '../../../interface/workload';

export class AthenaPlatformConfiguration extends PlatformConfiguration implements IAthenaPlatformConfiguration {
  settings!: AthenaSettings;

  constructor() {
    super();
    this.platformType = PlatformType.ATHENA;
    this.workloadType = new Array<WorkloadType>();
    this.workloadType .push(WorkloadType.OLAP);
  }
}

export class AthenaSettings implements IAthenaSettings {
  enforceWorkgroupConfiguration!: boolean;
  bytesScannedCutoffPerQuery!: number;
}
