import { IPlatformConfiguration } from "../interface/platform";
import { ConfigurationItem } from "./configuration";

export class PlatformConfiguration extends ConfigurationItem implements IPlatformConfiguration {
    platformType!: string;
}