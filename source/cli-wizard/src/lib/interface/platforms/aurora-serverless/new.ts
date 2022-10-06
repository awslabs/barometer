import {IPlatformConfiguration} from '../../platform';

export interface IAuroraServerlessPlatformConfiguration extends IPlatformConfiguration {
    settings: IAuroraServerlessSettings;
}

export interface IAuroraServerlessSettings {
    engine: string;
    minCapacity: number;
    maxCapacity: number;
}