import { IPlatformConfiguration } from '../../platform';

export interface IAthenaPlatformConfiguration extends IPlatformConfiguration {
    settings: IAthenaSettings;
}

export interface IAthenaSettings {
    enforceWorkgroupConfiguration: boolean;
    bytesScannedCutoffPerQuery: number;
}
