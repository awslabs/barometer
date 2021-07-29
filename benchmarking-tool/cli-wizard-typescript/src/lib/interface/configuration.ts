import { IExperimentConfiguration } from "./experiment";
import { IPlatformConfiguration } from "./platform";
import { IWorkloadConfiguration } from "./workload";

export enum ConfigurationType {
  EXPERIMENT = "experiments",
  PLATFORM = "platforms",
  WORKLOAD = "workloads",
}

export interface IConfiguration extends IConfigurationItem {
  /**
   * This key contains all the data associated with
   * the experiments.
   */
  experiments: {
    [key: string]: IExperimentConfiguration;
  };

  /**
   * This key defines the configuration to
   * apply to the platform.
   */
  platforms: {
    [key: string]: IPlatformConfiguration;
  };

  /**
   * This key defines the configuration to
   * apply to the workload.
   */
  workloads: {
    [key: string]: IWorkloadConfiguration;
  };

  /**
 * This key defines the count of items in the current configuration.
 */
  entrycount: number;
}

export interface IConfigurationItem {

  /**
   * This key defines the id.
   */
  id: string;

  /**
   * This key defines the name.
   */
  name: string;

  /**
 * This key defines the type of configurationitem.
 */
  configType: string;

  /**
   * This key defines the description.
   */
  description?: string;
  /**
   * This key defines the mandatory tags to apply to the deployment.
   */
  tags?: {
    [key: string]: string;
  };

}
