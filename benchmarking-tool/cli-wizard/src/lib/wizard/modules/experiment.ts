import {Configuration} from '../../impl/configuration';
import {CLIModule} from '../common/cli-module';

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
            name: 'value',
            message: 'Which action would you like to execute ?',
            choices: [
                {name: 'Add an experiment', value: '../modules/experiments/new'},
                {name: 'Run an experiment', value: '../modules/experiments/run'},
                this.getQuestionSeparator(),
                {name: 'Return to the previous menu', value: 'exit-module'},
                {name: 'Exit CLI', value: 'exit'},
                this.getQuestionSeparator(),
            ],
        });
    }
}
