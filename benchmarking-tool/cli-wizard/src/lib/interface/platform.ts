import {IConfigurationItem} from './configuration';

export enum PlatformType {
    REDSHIFT = "redshift",
    ATHENA = "athena",
}

export enum PlatformTypeName {
    REDSHIFT = "Amazon Redshift",
    ATHENA = "Amazon Athena",
}

export interface IPlatformConfiguration extends IConfigurationItem {

    platformType: PlatformType;

}
