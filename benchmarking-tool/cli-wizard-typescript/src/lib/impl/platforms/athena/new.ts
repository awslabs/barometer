

import { IAthenaPlatformConfiguration, IAthenaSettings, IAthenaFeatures } from '../../../interface/platforms/athena/existing';
import { PlatformConfiguration } from '../../platform';

const PLATFORM_TYPE = "ATHENA"
export class AthenaPlatformConfiguration extends PlatformConfiguration implements IAthenaPlatformConfiguration {
  settings!: AthenaSettings;
  constructor() {
    super();
    this.platformType = PLATFORM_TYPE;
  }
}

export class AthenaSettings implements IAthenaSettings {
  description?: string | undefined;
  numberOfNodes!: number;
  features!: IAthenaFeatures;
}

export class AthenaFeatures implements IAthenaFeatures {
  workloadManager!: boolean;
  concurrencyScaling!: boolean;
  aqua!: boolean;
  spectrum!: boolean;
}

