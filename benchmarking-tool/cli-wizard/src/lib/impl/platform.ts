import {ConfigurationType} from '../interface/configuration';
import {IPlatformConfiguration, PlatformType} from "../interface/platform";
import {ConfigurationItem} from "./configuration";

export class PlatformConfiguration extends ConfigurationItem implements IPlatformConfiguration {
    platformType!: PlatformType;

    constructor() {
        super();
        this.configType = ConfigurationType.PLATFORM;
    }
}