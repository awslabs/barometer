
import { NodeType } from '@aws-cdk/aws-redshift';
import { IRedshiftFeatures, IRedshiftPlatformConfiguration, IRedshiftSettings } from '../../../interface/platforms/redshift/new';
import { PlatformConfiguration } from '../../platform';

const PLATFORM_TYPE = "REDSHIFT";
export class RedshiftPlatformConfiguration extends PlatformConfiguration implements IRedshiftPlatformConfiguration {
  settings!: RedshiftSettings;

  constructor() {
    super();
    this.platformType = PLATFORM_TYPE;
  }
}

export class RedshiftSettings implements IRedshiftSettings {
  description?: string | undefined;
  nodeType!: NodeType;
  numberOfNodes!: number;
  features!: IRedshiftFeatures;
}

export class RedshiftFeatures implements IRedshiftFeatures {
  workloadManager!: boolean;
  concurrencyScaling!: boolean;
  aqua!: boolean;
  spectrum!: boolean;
}

