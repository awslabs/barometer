import { IPlatformConfiguration } from '../../platform';

export interface IAthenaPlatformConfiguration extends IPlatformConfiguration {
    settings: IAthenaSettings;
}

export interface IAthenaSettings {
    numberOfNodes: number,
    features: IAthenaFeatures
}

export interface IAthenaFeatures {
    workloadManager: boolean,
    concurrencyScaling: boolean,
    aqua: boolean,
    spectrum: boolean
}
