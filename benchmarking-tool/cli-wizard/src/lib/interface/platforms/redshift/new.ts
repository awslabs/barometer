import { NodeType } from "@aws-cdk/aws-redshift";
import { IPlatformConfiguration } from '../../platform';

export interface IRedshiftPlatformConfiguration extends IPlatformConfiguration {
    settings: IRedshiftSettings;
}

export interface IRedshiftSettings {
    nodeType: NodeType;
    numberOfNodes: number;
    features: IRedshiftFeatures;
}

export interface IRedshiftFeatures {
    workloadManager: boolean;
    concurrencyScaling: boolean;
    aqua: boolean;
    spectrum: boolean;
}