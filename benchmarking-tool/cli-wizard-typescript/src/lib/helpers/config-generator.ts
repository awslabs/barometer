import * as inquirer from 'inquirer';

import * as PlatformModule from '../wizard/modules/platform';
import * as WorkloadModule from '../wizard/modules/workload';
import * as ExperimentModule from '../wizard/modules/experiment';

import * as Configuration from '../validators/configuration';

/**
 * Prompts the user whether the configuration is valid
 * and should be written.
 */
const CLIExportConfigurationQuestions = [{
  type: 'confirm',
  name: 'value',
  message: 'Would you like to export your current configuration before exiting ?',
  default: false,
}];
const CLIImportConfigurationQuestions = [{
  type: 'confirm',
  name: 'value',
  message: 'Do you want to import an existing configuration file?',
  default: false,
}]
const CLISelectComponentQuestion = [{
  type: 'list',
  name: 'value',
  message: 'Which action would you like to execute ?',
  hint: '- Use <space> to select and <return> to submit.',
  choices: [
    { 'name': 'Manage platforms', 'value': 'platform' },
    { 'name': 'Manage workloads', 'value': 'workload', disabled: 'Unavailable at this time', },
    { 'name': 'Manage experiments', 'value': 'experiment', disabled: 'Unavailable at this time', },
    new inquirer.Separator(),
    { 'name': 'Display current configuration', 'value': 'display' },
    { 'name': 'Save current configuration', 'value': 'save' },
    { 'name': 'Reset current configuration', 'value': 'reset' },
    { 'name': 'Load existing configuration', 'value': 'load' },
    new inquirer.Separator(),
    { 'name': 'Exit CLI', 'value': 'exit' },
    new inquirer.Separator(),
  ]
}];

const promptImportConfigurationWizard = async (): Promise<Configuration.IConfiguration> => {
  const configuration: Configuration.IConfiguration = new Configuration.Configuration();
  const answers = await (inquirer.prompt(CLIImportConfigurationQuestions).then((answers) => {
    return answers;
  }));
  if (answers.value) {
    await configuration.loadConfiguration();
  }
  return configuration;
};

const promptExportConfigurationWizard = async (configuration: Configuration.IConfiguration): Promise<Configuration.IConfiguration> => {
  const answers = await (inquirer.prompt(CLIExportConfigurationQuestions).then((answers) => {
    return answers;
  }));
  if (answers.value) {
    await configuration.saveConfiguration();
  }
  return configuration;
}

const promptSelectComponentWizard = async (configuration: Configuration.IConfiguration): Promise<[string, Configuration.IConfiguration]> => {
  const nextstep: string = await (inquirer.prompt(CLISelectComponentQuestion).then(async (answers) => {
    if (answers.value) {
      switch (answers.value) {
        case 'experiment':
          [answers.value, configuration] = await runConfigurationWizardExperiment(configuration);
          break;
        case 'platform':
          [answers.value, configuration] = await runConfigurationWizardPlatform(configuration);
          break;
        case 'workload':
          [answers.value, configuration] = await runConfigurationWizardWorkload(configuration);
          break;
        case 'display':
          configuration.displayConfiguration();
          break;
        case 'save':
          await configuration.saveConfiguration();
          break;
        case 'load':
          await configuration.loadConfiguration();
          break;
        case 'reset':
          configuration = new Configuration.Configuration();
          break;
        case 'exit':
          console.log("Exiting.");
          break;
        default:
          console.log("Exiting.");
          answers.value = "exit"
          break;
      }
    }
    return answers.value;
  }));
  return [nextstep, configuration];
}

/**
 * Prompts the user for different information and
 * returns the gathered configuration.
 */
export const runConfigurationWizard = async (): Promise<Configuration.IConfiguration> => {
  // propose to import an existing configuration
  let configuration: Configuration.IConfiguration = await promptImportConfigurationWizard();

  // prompt to execute an action until the user decide to stop
  let nextstep = "";
  [nextstep, configuration] = await promptSelectComponentWizard(configuration);
  while (nextstep !== "exit") {
    [nextstep, configuration] = await promptSelectComponentWizard(configuration);
  }

  // propose to export the current configuration
  await (promptExportConfigurationWizard(configuration));
  return configuration;
};

const runConfigurationWizardExperiment = async (configuration: Configuration.IConfiguration): Promise<[string, Configuration.IConfiguration]> => {
  return await PlatformModule.runConfigurationModule(configuration);
};

const runConfigurationWizardPlatform = async (configuration: Configuration.IConfiguration): Promise<[string, Configuration.IConfiguration]> => {
  return await ExperimentModule.runConfigurationModule(configuration);
};

const runConfigurationWizardWorkload = async (configuration: Configuration.IConfiguration): Promise<[string, Configuration.IConfiguration]> => {
  return await WorkloadModule.runConfigurationModule(configuration);
};