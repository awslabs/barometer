#!/usr/bin/env node
import * as prompts from 'prompts';
import fs from 'fs';
import path from 'path';

import {IConfiguration} from '../../helpers/validators/configuration';
import {WorkloadsModule} from './lib/workloads-module';
import {PlatformsModule} from './lib/platforms-module';
import {ExperimentsModule} from './lib/experiments-module';
import {PromptComponent} from './lib/prompt-component';
import {onCancel} from './lib/handlers';

// The path to the configuration file.
const filePath = path.resolve(__dirname, '..', '..', '..', 'benchmarking-tool-config.json');

/**
 * Wizard questions for level 1 choices.
 * 1. Workloads
 * 2. Platforms
 * 3. Experiments
 * 4. Save & Run
 * 5. Reset all
 */
const componentQuestion = {
    type: 'select',
    name: 'path',
    message: 'What do you want to do?',
    choices: [
        {title: 'Manage Workloads', 'value': 'workloads'},
        {title: 'Manage Platforms', 'value': 'platforms'},
        {title: 'Manage Experiments', 'value': 'experiments'},
        {title: 'Save & Run', 'value': 'save-and-run'},
        {title: 'Reset All', 'value': 'reset'},
    ]
};


/**
 * A map between component identifiers and their instance.
 */
const moduleMap: { [key: string]: PromptComponent } = {
    'workloads': new WorkloadsModule(),
    'platforms': new PlatformsModule(),
    'experiments': new ExperimentsModule()
};


/**
 * Prompts the user for different information and
 * returns the gathered configuration.
 */
const getConfiguration = async (): Promise<IConfiguration> => {
    let configuration: IConfiguration = {};

    // Test if past configuration already exists
    if (fs.existsSync(filePath)) {
        // Load past configuration if it already present
        configuration = JSON.parse(fs.readFileSync(filePath).toString('utf-8'));
    }
    while (true) {
        const mainAnswer: string = (await prompts.prompt(componentQuestion, {onCancel})).value;

        if (mainAnswer == 'reset')
            configuration = {}

        if (mainAnswer == "save-and-run")
            break;

        const moduleImpl = moduleMap[mainAnswer];
        if (moduleImpl) {
            try {
                await moduleImpl.prompt(configuration);
            } catch (e) {
                console.log(e.message);
                process.exit(0);
            }
        }
    }
    return (configuration);
}

(async () => {
    const configuration = await getConfiguration();

    // The pretty-printed version of the configuration.
    const data = JSON.stringify(configuration, null, 2);

    // Displaying the content of the configuration file.
    console.log(data);

    // Writing the configuration.
    fs.writeFileSync(filePath, data);
    console.log(`\nThe configuration has been successfully written to ${filePath}.\nYou can now deploy the experiments by running :\n\ncdk deploy`);
})();