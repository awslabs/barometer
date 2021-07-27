

import { IAthenaPlatformConfiguration, IAthenaSettings } from '../../../interface/platforms/athena/new';
import { PlatformConfiguration } from '../../platform';

const PLATFORM_TYPE = "ATHENA";
export class AthenaPlatformConfiguration extends PlatformConfiguration implements IAthenaPlatformConfiguration {
  settings!: AthenaSettings;
  constructor() {
    super();
    this.platformType = PLATFORM_TYPE;
  }
}

export class AthenaSettings implements IAthenaSettings {
  enforceWorkgroupConfiguration!: boolean;
  bytesScannedCutoffPerQuery!: number;
}