import {IAthenaPlatformConfiguration, IAthenaSettings} from '../../../interface/platforms/athena/new';

import {PlatformType} from '../../../interface/platform';
import {PlatformConfiguration} from '../../platform';

export class AthenaPlatformConfiguration extends PlatformConfiguration implements IAthenaPlatformConfiguration {
    settings!: AthenaSettings;

    constructor() {
        super();
        this.platformType = PlatformType.ATHENA;
    }
}

export class AthenaSettings implements IAthenaSettings {
    enforceWorkgroupConfiguration!: boolean;
    bytesScannedCutoffPerQuery!: number;
}
