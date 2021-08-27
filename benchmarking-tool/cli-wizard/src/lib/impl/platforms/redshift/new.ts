
import { NodeType } from '@aws-cdk/aws-redshift';
import { PlatformType } from '../../../interface/platform';
import { IRedshiftFeatures, IRedshiftPlatformConfiguration, IRedshiftSettings } from '../../../interface/platforms/redshift/new';
import { WorkloadType } from '../../../interface/workload';
import { PlatformConfiguration } from '../../platform';

export class RedshiftPlatformConfiguration extends PlatformConfiguration implements IRedshiftPlatformConfiguration {
  settings!: RedshiftSettings;

  constructor() {
    super();
    this.platformType = PlatformType.REDSHIFT;
    this.workloadType = new Array<WorkloadType>();
    this.workloadType.push(WorkloadType.OLAP);
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
}

