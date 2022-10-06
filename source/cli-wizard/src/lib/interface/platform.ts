import {IConfigurationItem} from './configuration';

export enum PlatformType {
    REDSHIFT = "redshift",
    ATHENA = "athena",
    AURORA_SERVERLESS = "aurora-serverless",
}

export enum PlatformTypeName {
    REDSHIFT = "Amazon Redshift",
    ATHENA = "Amazon Athena",
    AURORA_SERVERLESS = "Aurora Serverless"
}

export interface IPlatformConfiguration extends IConfigurationItem {

    platformType: PlatformType;
    loadDataset: boolean;

}
