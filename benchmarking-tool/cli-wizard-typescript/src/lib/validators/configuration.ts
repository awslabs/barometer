import * as Joi from 'joi';
import * as fs from 'fs';
import * as inquirer from 'inquirer';

import { experimentSchema, IExperimentConfiguration } from './experiment';
import { platformSchema, IPlatformConfiguration } from './platform';
import { workloadSchema, IWorkloadConfiguration } from './workload';

/**
 * Describes a configuration associated with the
 * current stack in Typescript.
 */
export interface IConfiguration {
  displayConfiguration(): void;
  saveConfiguration(): Promise<void>;
  loadConfiguration(): Promise<void>;

  /**
   * This key contains all the data associated with
   * the experiments.
   */
  experiments: {
    [key: string]: IExperimentConfiguration
  };

  /**
   * This key defines the configuration to
   * apply to the platform.
   */
  platforms: {
    [key: string]: IPlatformConfiguration
  };

  /**
   * This key defines the configuration to
   * apply to the workload.
   */
  workloads: {
    [key: string]: IWorkloadConfiguration
  };

  /**
   * This key defines the mandatory tags to apply to the deployment.
   */
  tags?: {
    [key: string]: string
  };

  /**
 * This key defines the count of items in the current configuration.
 */
  entrycount: number;
}

export interface IConfigurationItem {

  /**
   * This key defines the id.
   */
  id: string;

  /**
   * This key defines the name.
   */
  name: string;

  /**
   * This key defines the description.
   */
  description?: string;
  /**
   * This key defines the mandatory tags to apply to the deployment.
   */
  tags?: {
    [key: string]: string
  };

}
/**
 * The `Joi` schema for validating the configuration.
 */
export const schema = Joi.object().keys({
  experiment: experimentSchema.optional(),
  platform: platformSchema.optional(),
  workload: workloadSchema.optional(),
  tags: Joi.object().default({}).optional()
}).unknown().required();

export class Configuration implements IConfiguration {
  experiments: { [key: string]: IExperimentConfiguration; };
  platforms: { [key: string]: IPlatformConfiguration; };
  workloads: { [key: string]: IWorkloadConfiguration; };
  tags?: { [key: string]: string; } | undefined;
  entrycount: number;

  constructor() {
    this.experiments = {};
    this.platforms = {};
    this.workloads = {};
    this.tags = {};
    this.entrycount = 0;
  }


  displayConfiguration(): void {
    console.log("---------------------------------------------------------------------------------")
    console.log(JSON.stringify(this, null, 2))
    console.log("---------------------------------------------------------------------------------")    
  }

  async loadConfiguration(): Promise<void> {
    // TODO: need to implement a validation of the format/content before reading 
    const questions = [{
      type: 'input',
      name: 'value',
      message: 'Input the full path for loading the current configuration:',
    },];
    await (inquirer.prompt(questions).then((answers) => {
      if (answers.value) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const tmp = require(answers.value);
          this.experiments = tmp.experiments;
          this.platforms = tmp.platforms;
          this.workloads = tmp.workloads;
          this.tags = tmp.experiments;
          this.entrycount = 0;
          console.log("here");
          this.displayConfiguration();
        } catch (e) {
          console.error(`
            The provided configuration file could not be found. ${answers.value}
          `);
          console.log(e);
          process.exit(1);
        }
      }
      return answers;
    }));
  }



  async saveConfiguration(): Promise<void> {
    // TODO: need to implement a validation of the format/content before writing
    const questions = [{
      type: 'input',
      name: 'value',
      message: 'Input the full path for exporting the current configuration:',
    },];
    await (inquirer.prompt(questions).then((answers) => {
      if (answers.value) {
        try {
          const data = JSON.stringify(this, null, 2);
          fs.writeFileSync(answers.value, data);
          console.log(`\nThe configuration has been successfully written to : ${answers.value}.`);
        } catch (e) {
          console.error(`
            The provided configuration file could not be found. ${answers.value}
          `);
          console.log(e);
          process.exit(1);
        }
      }
      return answers;
    }));
  }

}
