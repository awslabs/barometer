from aws_cdk import (
    core,
    aws_lambda as _lambda
)


# noinspection PyBroadException
class RedshiftDataLoad(core.Stack):
    def __init__(self, scope: core.Construct, construct_id: str, input_vpc, input_vpc_sg, input_subnets, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # If required, fetch VPC subnets for the new Lambda function:
        # - e.g.
        #   vpc_subnets_select = ec2.SubnetSelection(subnets=[input_subnets]).subnets

        # Create lambda function, to execute statements against the Database
        self.query_function = _lambda.Function(self, "lambda_function",
                                               runtime=_lambda.Runtime.PYTHON_3_8,
                                               handler="run_query.lambda_handler",
                                               code=_lambda.Code.from_asset("aws_lambda"),
                                               vpc=input_vpc,
                                               security_groups=[input_vpc_sg]
                                               )

        # Grant Lambda to access the new Redshift cluster, via Output
        self.query_function_role = self.query_function.role.role_arn
        core.CfnOutput(self, "lambda-role-arn", value=self.query_function_role)
