import { IExperimentConfiguration } from "../interface/experiment";
import { ConfigurationItem } from "./configuration";

const CONFIG_TYPE = "experiments";
export class ExperimentConfiguration extends ConfigurationItem implements IExperimentConfiguration {
  experimentType!: string;

  constructor() {
    super();
    this.configType = CONFIG_TYPE;
  }
}