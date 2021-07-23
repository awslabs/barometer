

import { IAthenaPlatformConfiguration, IAthenaSettings, IAthenaFeatures } from '../../../interface/platforms/athena/existing';
import { PlatformConfiguration } from '../../platform';

export class AthenaPlatformConfiguration extends PlatformConfiguration implements IAthenaPlatformConfiguration {
  settings!: AthenaSettings;
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

