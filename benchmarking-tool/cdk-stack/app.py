#!/usr/bin/env python3

from aws_cdk import core
from aws_prereqs.vpc_prereqs import CdkVpcPrereqsStack
from aws_redshift.redshift_cluster_main import RedshiftClusterStack
from aws_redshift.redshift_load_tpc_data import RedshiftDataLoad

app = core.App()


"""
User inputs:
    - i.e. from the web application or from the CFN template.
    Optional:
    - Reuse existing VPC; e.g. 
        user_input_vpc_id = 'vpc-36cdd450'
"""
user_input_vpc_id = ''
user_input_aws_account_id = '862990518977'
user_input_rs_region = 'EU (Ireland),eu-west-1'
user_input_rs_cluster_identifier = 'data-benchmarking-rs-small-dc-cluster-1'
user_input_rs_node_type = 'dc2.large'
user_input_rs_number_of_nodes = 2
user_input_rs_service_code = 'AmazonRedshift'
user_input_rs_contract_service_term = 'OnDemand'
user_input_workload_type = 'tpc-h-v3'
user_input_dataset_s3_path = 's3://aws-prototype-solution-data-benchmark-dev/datasets/tpc-data'

# Environment settings
user_input_rs_region_full_name = user_input_rs_region.split(',')[0]
user_input_rs_region = user_input_rs_region.split(',')[1]
env_ireland = core.Environment(account=user_input_aws_account_id, region=user_input_rs_region)

# Init VPC and Prereqs (e.g. subnet, security groups) stack:
vpc_prereqs_stack = CdkVpcPrereqsStack(app, "cdk-vpc-prereqs", env=env_ireland,
                                       input_vpc_id=user_input_vpc_id)

# Function to load data to Amazon Redshift:
"""
Note:
* if execution is required, to load data into the database, the minimum variables to use are:
  - rs_cluster_stack.rs_cluster.cluster_identifier
  - rs_cluster_stack.rs_cluster.db_name
  - optional: rs_cluster_stack.rs_cluster.master_username, user_input_workload_type, user_input_dataset_s3_path
  
"""
rs_load_data_function = RedshiftDataLoad(app, "cdk-redshift-data-load", env=env_ireland,
                                         input_vpc=vpc_prereqs_stack.vpc,
                                         input_vpc_sg=vpc_prereqs_stack.sg_benchmark_tool_01,
                                         input_subnets=vpc_prereqs_stack.vpc_subnets)

# Init Redshift cluster (e.g. DB param, cluster, etc) stack:
rs_cluster_stack = RedshiftClusterStack(app, "cdk-redshift-cluster", env=env_ireland,
                                        input_aws_account_id=user_input_aws_account_id,
                                        input_aws_region=user_input_rs_region,
                                        input_subnets=vpc_prereqs_stack.vpc_subnets,
                                        input_vpc_sg=vpc_prereqs_stack.sg_benchmark_tool_01,
                                        input_load_fn_role=rs_load_data_function.query_function_role,
                                        input_rs_cluster_identifier=user_input_rs_cluster_identifier,
                                        input_rs_node_type=user_input_rs_node_type,
                                        input_rs_number_of_nodes=user_input_rs_number_of_nodes,
                                        input_rs_region_full_name=user_input_rs_region_full_name,
                                        input_rs_service_code=user_input_rs_service_code,
                                        input_rs_contract_service_term=user_input_rs_contract_service_term)

app.synth()
