import { IConfigurationItem } from './configuration';
import { WorkloadType } from './workload';

export enum PlatformType {
  REDSHIFT = "redshift",
  ATHENA = "athena",
}
export enum PlatformTypeName {
  REDSHIFT = "Amazon Redshift",
  ATHENA = "Amazon Athena",
}
export interface IPlatformConfiguration extends IConfigurationItem {

  platformType: PlatformType;
  workloadType: Array<WorkloadType>;

}
