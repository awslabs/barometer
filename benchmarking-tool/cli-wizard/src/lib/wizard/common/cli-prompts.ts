import { DEFAULT_CONFG_FILE_NAME } from '../../impl/configuration';

export const CLIModuleQuestions = {
  entryName: {
    type: 'input',
    name: 'name',
    message: 'Please provide name for this entry (You will be able to use by this name later)',
    validate: async (input: string | any[]): Promise<any> => {
      if (input.length > 0) return true;
      return 'Name can not be empty';
    },
  },
};

export const CLIModulePrompts = {
  exportConfiguration: [
    {
      type: 'list',
      name: 'value',
      message: 'How would you like to export your current configuration ?',
      choices: [
        { name: 'Save to default location ' + DEFAULT_CONFG_FILE_NAME, value: 'default' },
        { name: 'Save to custom location', value: 'custom' },
        { name: "Don't save", value: 'exit' },
      ],
    },
  ],
  exportConfigurationPath: [
    {
      type: 'input',
      name: 'value',
      message: 'Input the full path for exporting the current configuration:',
    },
  ],
  importConfiguration: [
    {
      type: 'list',
      name: 'value',
      message: 'How would you like to import your configuration ?',
      choices: [
        { name: 'Load from default location ' + DEFAULT_CONFG_FILE_NAME, value: 'default' },
        { name: 'Load from custom location', value: 'custom' },
        { name: "Don't load", value: 'exit' },
      ],
    },
  ],
  importConfigurationPath: [
    {
      type: 'input',
      name: 'value',
      message: 'Input the full path for loading the current configuration:',
    },
  ],
  addMoreConfigurationItem: [
    {
      type: 'confirm',
      name: 'value',
      message: 'Do you want to add an additional entry?',
      default: false,
    },
  ],
  overrideConfigurationItem: [
    {
      type: 'list',
      name: 'value',
      message: 'An entry with the same name exist. How do you want to proceed ?',
      choices: [
        { name: 'Rename entry', value: 'rename' },
        { name: 'Override existing entry', value: 'override' },
        { name: 'Discard change', value: 'discard' },
      ],
    },
    {
      type: 'input',
      name: 'name',
      message: 'Please provide name for this entry.',
      when: function (answers): boolean {
        return answers.value === 'rename';
      },
    },
  ],
};
