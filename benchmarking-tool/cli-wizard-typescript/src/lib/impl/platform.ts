import { IPlatformConfiguration } from "../interface/platform";
import { ConfigurationItem } from "./configuration";

const CONFIG_TYPE = "platforms";
export class PlatformConfiguration extends ConfigurationItem implements IPlatformConfiguration {
  platformType!: string;

  constructor() {
    super();
    this.configType = CONFIG_TYPE;
  }
}