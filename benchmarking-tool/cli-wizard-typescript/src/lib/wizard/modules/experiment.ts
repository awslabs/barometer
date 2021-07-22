import * as inquirer from 'inquirer';

import * as  Configuration from '../../validators/configuration';

const CLISelectModuleQuestion = [{
  type: 'list',
  name: 'value',
  message: 'Which platform would you like to configure ?',
  hint: '- Use <space> to select and <return> to submit.',
  choices: [
    { 'name': 'Redshift DC Single Node Cluster', 'value': 'redshift-dc-single-node' },
    { 'name': 'Redshift DC Multi Node Cluster', 'value': 'redshift-dc-multi-node' },
    { 'name': 'Redshift RA3 Multi Node Cluster', 'value': 'redshift-ra-multi-node', disabled: 'Unavailable at this time', },
    new inquirer.Separator(),
    { 'name': 'Display current configuration', 'value': 'display' },
    { 'name': 'Save current configuration', 'value': 'save' },
    { 'name': 'Reset current configuration', 'value': 'reset' },
    { 'name': 'Load existing configuration', 'value': 'load' },
    new inquirer.Separator(),
    { 'name': 'Return to the previous menu', 'value': 'exit-module' },
    { 'name': 'Exit CLI', 'value': 'exit' },
    new inquirer.Separator(),
  ]
}];

export const runConfigurationModule = async (configuration: Configuration.IConfiguration): Promise<[string, Configuration.IConfiguration]> => {
  // prompt to execute an action until the user decide to stop
  let nextstep = "";
  [nextstep, configuration] = await prompt(configuration);
  while (nextstep !== "exit" && nextstep !== "exit-module") {
    [nextstep, configuration] = await prompt(configuration);
  }
  return [nextstep, configuration];
};


const prompt = async (configuration: Configuration.IConfiguration): Promise<[string, Configuration.IConfiguration]> => {
  const nextstep: string = await (inquirer.prompt(CLISelectModuleQuestion).then(async (answers) => {
    if (answers.value) {
      switch (answers.value) {
        case 'redshift-dc-single-node':
          // configuration = await runConfigurationWizardExperiment(configuration);
          break;
        case 'redshift-dc-multi-node':
          // configuration = await runConfigurationWizardPlatform(configuration);
          break;
        case 'redshift-ra-multi-node':
          // configuration = await runConfigurationWizardWorkload(configuration);
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
        case 'exit-module':
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

