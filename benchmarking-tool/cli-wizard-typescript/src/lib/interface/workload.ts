import { IConfigurationItem } from './configuration';

export enum WorkloadType {
  OLAP = "olap",
  OLTP = "oltp",
  // CUSTOM = "custom",
}
export enum WorkloadTypeName {
  OLAP = "OLAP - Analytics",
  OLTP = "OLTP - Transactional",
  // CUSTOM = "Custom - Bring Your Own",
}
export interface IWorkloadConfiguration extends IConfigurationItem {
  workloadType: WorkloadType;
}
