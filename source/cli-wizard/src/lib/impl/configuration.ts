import { ConfigurationType, IConfiguration, IConfigurationItem } from '../interface/configuration';

export const DEFAULT_CONFG_FILE_NAME = process.cwd() + "/storage/benchmarking-config.json";

export class ConfigurationItem implements IConfigurationItem {
  id!: string;
  name!: string;
  configType!: ConfigurationType;
  description?: string | undefined;
  tags?: { [key: string]: string; } | undefined;

  constructor() {
    const {
      v4: uuidv4,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
    } = require('uuid');
    this.id = uuidv4();
  }
}

export class Configuration extends ConfigurationItem implements IConfiguration {
  experiments: { [key: string]: any; };
  platforms: { [key: string]: any; };
  workloads: { [key: string]: any; };

  entrycount: number;

  loaded = false;

  constructor() {
    super();
    this.experiments = {};
    this.platforms = {};
    this.workloads = {};
    this.tags = {};
    this.entrycount = 0;
  }
  generateUUID(): string {
    const {
      v4: uuidv4,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
    } = require('uuid');
    return uuidv4();
  }

  buildFrom(config: IConfiguration): void {
    this.experiments = config.experiments;
    this.platforms = config.platforms;
    this.workloads = config.workloads;
    this.tags = config.tags;
    this.entrycount = 0;
  }
  toSaveFormat(): string {
    const config = {
      experiments: this.experiments,
      platforms: this.platforms,
      workloads: this.workloads,
      tags: this.tags
    };
    return JSON.stringify(config, null, 2);
  }

  validate(): void {
    throw new Error('Method not implemented.');
  }

  print(): void {
    console.log("---------------------------------------------------------------------------------");
    console.log(this.toSaveFormat());
    console.log("---------------------------------------------------------------------------------");
  }
}
