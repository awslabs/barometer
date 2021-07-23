import * as fs from 'fs';
import * as inquirer from 'inquirer';

import { IConfiguration, IConfigurationItem } from '../interface/configuration';


export const DEFAULT_CONFG_FILE_NAME = process.cwd() + "/benchmarking-config.json";

export class ConfigurationItem implements IConfigurationItem {
  id!: string;
  name!: string;
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
  lastSavePath = DEFAULT_CONFG_FILE_NAME;

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
    console.log("---------------------------------------------------------------------------------")
    console.log(this.toSaveFormat())
    console.log("---------------------------------------------------------------------------------")
  }

  async load(path: string): Promise<void> {
    try {
      const config = JSON.parse(fs.readFileSync(path, 'utf8'));
      this.buildFrom(config);

      // TODO: need to implement a validation of the format/content before reading 

    } catch (e) {
      console.error(`Configuration file not found: ${path}. Creating ...`);
      this.buildFrom(new Configuration());
      await this.save(path);
      require(path);
    }
  }

  async loadWithPrompt(): Promise<void> {
    const questions = [{
      type: 'input',
      name: 'value',
      message: 'Input the full path for loading the current configuration:',
    },];
    const path = await (inquirer.prompt(questions).then((answers) => {
      return answers.value;
    }));
    this.load(path);
  }

  async loadDefault(): Promise<void> {
    (await this.load(DEFAULT_CONFG_FILE_NAME));
  }

  async save(path: string): Promise<void> {
    try {
      fs.writeFileSync(path, this.toSaveFormat());
      this.lastSavePath = path;
      console.log(`\nThe configuration has been successfully written to : ${path}.`);

      // TODO: need to implement a validation of the format/content before writing

    } catch (e) {
      console.error(`
        The provided configuration file could not be found. ${path}
      `);
      console.log(e);
      process.exit(1);
    }
  }

  async saveWithPrompt(): Promise<void> {
    const questions = [{
      type: 'input',
      name: 'value',
      message: 'Input the full path for exporting the current configuration:',
    },];
    const path = await (inquirer.prompt(questions).then((answers) => {
      return answers.value;
    }));
    this.save(path);

  }

  async saveDefault(): Promise<void> {
    await this.save(DEFAULT_CONFG_FILE_NAME);
  }
}
