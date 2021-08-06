import {Construct} from "@aws-cdk/core";
import {Code, Function, Runtime} from "@aws-cdk/aws-lambda";

const path = require('path');
const fs = require('fs');


/**
 * Defines all common lambda functions
 */
export class CommonFunctions extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);
        // Path to common-functions root folder
        const directoryPath: string = path.join(__dirname, '../../common-functions/');
        let functions = fs.readdirSync(directoryPath);
        // Create all Lambda functions
        for (let i = 0; i < functions.length; i++) {
            new Function(this, functions[i], {
                code: Code.fromAsset(directoryPath + "/" + functions[i]),
                handler: "app.lambda_handler",
                runtime: Runtime.PYTHON_3_8
            });
        }
    }
}