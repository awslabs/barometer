import {ConfigurationType} from '../interface/configuration';
import {IPlatformConfiguration, PlatformType} from "../interface/platform";
import {ConfigurationItem} from "./configuration";

export class PlatformConfiguration extends ConfigurationItem implements IPlatformConfiguration {
    platformType!: PlatformType;
    loadDataset!: boolean;

    constructor() {
        super();
        this.configType = ConfigurationType.PLATFORM;
    }
}