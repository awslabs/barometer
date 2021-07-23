import { IConfigurationItem } from './configuration';

/**
 * A description of the platform configuration
 * in Typescript.
 */
export interface IPlatformConfiguration extends IConfigurationItem {

  platformType: string;

  tags?: {
    [key: string]: string
  };
}
