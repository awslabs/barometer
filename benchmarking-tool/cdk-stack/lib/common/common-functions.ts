import {Construct} from "@aws-cdk/core";
import {Code, Function, Runtime} from "@aws-cdk/aws-lambda";
import {Bucket} from "@aws-cdk/aws-s3";

const path = require('path');

interface CommonFunctionsProps {
    dataBucket: Bucket
}


/**
 * Defines all common lambda functions
 */
export class CommonFunctions extends Construct {

    public readonly createDestroyPlatform: Function;
    public readonly dashboardBuilder: Function;
    public readonly dataCopier: Function;
    public readonly jdbcQueryRunner: Function;
    public readonly stepFunctionHelpers: Function;

    constructor(scope: Construct, id: string, props: CommonFunctionsProps) {
        super(scope, id);
        // Path to common-functions root folder
        const directoryPath: string = path.join(__dirname, '../../common-functions/');

        this.createDestroyPlatform = new Function(this, "createDestroyPlatform", {
            code: Code.fromAsset(directoryPath + "create-destory-platform"),
            handler: "app.lambda_handler",
            runtime: Runtime.PYTHON_3_8
        });

        this.dashboardBuilder = new Function(this, "dashboardBuilder", {
            code: Code.fromAsset(directoryPath + "dashboard-builder"),
            handler: "app.lambda_handler",
            runtime: Runtime.PYTHON_3_8
        });

        this.dataCopier = new Function(this, "dataCopier", {
            code: Code.fromAsset(directoryPath + "data-copier"),
            handler: "app.lambda_handler",
            runtime: Runtime.PYTHON_3_8
        });

        this.jdbcQueryRunner = new Function(this, "jdbcQueryRunner", {
            code: Code.fromAsset(directoryPath + "jdbc-query-runner"),
            handler: "app.lambda_handler",
            runtime: Runtime.PYTHON_3_8
        });

        this.stepFunctionHelpers = new Function(this, "helpers", {
            code: Code.fromAsset(directoryPath + "stepfn-helpers"),
            handler: "app.lambda_handler",
            runtime: Runtime.PYTHON_3_8
        });
    }

}