import {PlatformType} from '../../../interface/platform';
import {PlatformConfiguration} from '../../platform';
import {
    IAuroraServerlessPlatformConfiguration,
    IAuroraServerlessSettings
} from "../../../interface/platforms/aurora-serverless/new";

export class AuroraServerlessPlatformConfiguration extends PlatformConfiguration implements IAuroraServerlessPlatformConfiguration {
    settings!: AuroraServerlessSettings;

    constructor() {
        super();
        this.platformType = PlatformType.AURORA_SERVERLESS;
    }
}

export class AuroraServerlessSettings implements IAuroraServerlessSettings {
    description?: string | undefined;
    engine!: string;
    maxCapacity!: number;
    minCapacity!: number;
}
