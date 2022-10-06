import {Configuration} from '../../../../impl/configuration';
import {CLIModule} from '../../../common/cli-module';
import {CLIModuleQuestions} from '../../../common/cli-prompts';
import {
    AuroraServerlessPlatformConfiguration,
    AuroraServerlessSettings
} from "../../../../impl/platforms/aurora-serverless/new";

export class Module {
    public static getInstance(configuration: Configuration): AuroraServerlessModule {
        return new AuroraServerlessModule(configuration, 'AuroraServerlessModule');
    }
}

export class AuroraServerlessModule extends CLIModule {
    /**
     * Questions to be prompted
     */
    setQuestions(): void {
        this.questions = new Array<any>();
        this.questions.push(CLIModuleQuestions.entryName);
        this.questions.push({
            type: 'list',
            name: 'engine',
            message: 'Which Aurora serverless engine you want to use?',
            default: "aurora-mysql",
            choices: [
                "aurora-mysql",
                "aurora-postgresql"
            ]
        });
        this.questions.push({
            type: 'input',
            name: 'minCapacity',
            message: 'Select minimum capacity for Aurora serverless ?',
            default: 4
        });
        this.questions.push({
            type: 'input',
            name: 'maxCapacity',
            message: 'Select maximum capacity for Aurora serverless ?',
            default: 32
        });
    }

    async runModuleQuestions(): Promise<[string, Configuration]> {
        await this.askQuestions(this.getQuestions()).then(async (answers) => {
            if (answers) {
                const settings = new AuroraServerlessSettings();
                settings.minCapacity = answers.minCapacity;
                settings.maxCapacity = answers.maxCapacity;
                settings.engine = answers.engine;

                const entry = new AuroraServerlessPlatformConfiguration();
                entry.name = answers.name;
                entry.settings = settings;
                entry.loadDataset = true;

                await this.addEntry(entry);
            }
        });
        this.nextstep = 'continue';
        if (!(await this.askAddMoreEntry())) {
            this.nextstep = 'exit-module';
        }
        return [this.nextstep, this.configuration];
    }
}
