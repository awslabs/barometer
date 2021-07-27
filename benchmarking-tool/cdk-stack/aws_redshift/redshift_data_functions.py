import json
from aws_cdk import (
    core,
    aws_lambda as _lambda,
    aws_stepfunctions as sfn,
    aws_stepfunctions_tasks as tasks
)
"""
Example of input payload. These will be sent directly to the Step Function.

    Input params:
    payload_input = {'rs_cluster': 'data-benchmarking-rs-small-dc-cluster-1',
                     'rs_db_name': 'benchmark_db',
                     'db_user': 'dwh_benchmark_admin',
                     'sql_input': 'select * from testing_io;',
                     'query_id': ''}
                     
    run_payload_input = json.dumps(payload_input)
    
    # Adding input to Step fn directly (not recommended):
    submit_job = tasks.LambdaInvoke(self, "Submit Query",
    ...
        payload=sfn.TaskInput.from_text(run_payload_input)
"""


# noinspection PyBroadException
class RedshiftData(core.Stack):
    def __init__(self, scope: core.Construct, construct_id: str, input_vpc, input_vpc_sg, input_subnets, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # If required, fetch VPC subnets for the new Lambda function:
        # - e.g.
        #   vpc_subnets_select = ec2.SubnetSelection(subnets=[input_subnets]).subnets

        # Create lambda function, to execute statements against the Database
        self.query_function = _lambda.Function(self, "lambda_function_1",
                                               runtime=_lambda.Runtime.PYTHON_3_8,
                                               handler="run_query.lambda_handler",
                                               code=_lambda.Code.from_asset("aws_lambda"),
                                               vpc=input_vpc,
                                               security_groups=[input_vpc_sg],
                                               timeout=core.Duration.seconds(60)
                                               )

        # Submit new function, via Step Function
        submit_job = tasks.LambdaInvoke(self, "Submit Query",
                                        lambda_function=self.query_function
                                        )

        # Wait N seconds, before polling for query status:
        wait_x = sfn.Wait(self, "Wait X Seconds",
                          time=sfn.WaitTime.duration(core.Duration.seconds(2))
                          )

        # Possible status for Redshift query:
        # - SUBMITTED | PICKED | STARTED | FINISHED | ABORTED | FAILED | ALL
        get_status = tasks.LambdaInvoke(self, "Monitor Query",
                                        lambda_function=self.query_function,
                                        input_path='$.Payload'
                                        )
        # If job fails:
        job_failed = sfn.Fail(self, "Job Failed",
                              cause="AWS Lambda function failed",
                              error="Description to be added."
                              )
        
        # If job succeeds:
        final_status = tasks.LambdaInvoke(self, "Get Final Job Status",
                                          lambda_function=self.query_function,
                                          input_path='$.Payload'
                                          )

        # State Machine definition:
        state_machine_def_1 = submit_job.next(wait_x) \
            .next(get_status)\
            .next(sfn.Choice(self, "Query complete?")
                  .when(sfn.Condition.string_equals("$.Payload.query_submitted_status", "FAILED"), job_failed)
                  .when(sfn.Condition.string_equals("$.Payload.query_submitted_status", "FINISHED"), final_status).otherwise(wait_x)
                  )

        # Create state machine:
        sfn.StateMachine(self, "state_machine_def_1",
                         definition=state_machine_def_1,
                         timeout=core.Duration.minutes(5)
                         )

        # Lambda function output: run-query
        self.query_function_role = self.query_function.role.role_arn
        core.CfnOutput(self, "lambda-role-arn-1", value=self.query_function_role)
