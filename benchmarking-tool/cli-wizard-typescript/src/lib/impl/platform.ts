import { IPlatformConfiguration } from "../interface/platform";

const PLATFORM_TYPE = "REDSHIFT"
export class PlatformConfiguration implements IPlatformConfiguration {
    platformType!: string;
    tags?: { [key: string]: string; } | undefined;
    id: string;
    name!: string;
    description?: string | undefined;

    constructor() {
        const {
            v4: uuidv4,
            // eslint-disable-next-line @typescript-eslint/no-var-requires
        } = require('uuid');
        this.id = uuidv4();
        this.platformType = PLATFORM_TYPE;
    }

}