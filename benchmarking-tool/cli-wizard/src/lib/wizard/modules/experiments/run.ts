import {CLIModule} from '../../common/cli-module';
import {Configuration} from '../../../impl/configuration';

export class Module {
    public static getInstance(configuration: Configuration): ExperimentModule {
        return new ExperimentModule(configuration, 'ExperimentModule');
    }
}

export class ExperimentModule extends CLIModule {
    /**
     * Questions to be prompted
     */
    setQuestions(): void {
        this.questions = new Array<any>();
        this.questions.push({
            type: 'list',
            name: 'experimentName',
            message: 'Please select experiment to run.'
        });
    }

    async runModuleQuestions(): Promise<[string, Configuration]> {
        const _questions: Array<any> = this.getQuestions();
        const experimentNamePrompt = this.getQuestionByName(_questions, 'experimentName');
        experimentNamePrompt['choices'] = async (): Promise<Array<any>> => {
            const choices: Array<any> = [];
            for (const _key in this.configuration.experiments) {
                choices.push({
                    name: this.configuration.experiments[_key].name,
                    value: _key,
                });
            }
            if (choices.length === 0) {
                choices.push({name: 'No entries found.', disabled: true});
                choices.push(this.getQuestionSeparator());
                choices.push({name: 'Return to the previous menu', value: 'exit-module'});
            }
            return choices;
        };
        await this.askQuestions(_questions).then(async (answers) => {
            const experiment = this.configuration.experiments[answers.experimentName];
            experiment.settings;
            return answers;
        });
        this.nextstep = 'exit-module';
        return [this.nextstep, this.configuration];
    }
}
