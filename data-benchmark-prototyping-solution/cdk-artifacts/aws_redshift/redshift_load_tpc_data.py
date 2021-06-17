import traceback
from aws_redshift.redshift_helpers import run_query, copy_statement, get_cluster_details
from aws_cdk import (
    core
)


# noinspection PyBroadException
class RedshiftDataLoad(core.Stack):
    def __init__(self, scope: core.Construct, construct_id: str,
                 input_rs_cluster_name, input_rs_db_name, input_rs_username, input_workload_type, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        try:
            # Fetch Redshift details, assuming for now that there's only 1 IAM attached.
            rs_details = get_cluster_details(rs_cluster_name=input_rs_cluster_name)
            rs_iam_role = rs_details['Clusters'][0]['IamRoles'][0]['IamRoleArn']

            # Workload type to load:
            if input_workload_type == 'tpc-h-v3':
                print('Loading TPCH-V3...')
                ddl_tables = open('aws_redshift/tpc-h/create-tables.sql').read()
                tables_to_load = ['region']
                s3_base_path = 's3://tpch-lab-reusable-asset/tpc-h'
            else:
                # Still to define default's workload:
                print('Loading defaults workload...')
                ddl_tables = open('aws_redshift/tpc-h/create-tables.sql').read()
                tables_to_load = ['region']
                s3_base_path = 's3://tpch-lab-reusable-asset/other'

            # Create Tables:
            query_response = run_query(rs_cluster=input_rs_cluster_name,
                                       rs_db_name=input_rs_db_name,
                                       db_user=input_rs_username,
                                       sql_input=ddl_tables)

            # Query response:
            print(query_response)

            # Load data to new tables:
            for table in tables_to_load:
                # Data location
                s3_location = '{}/{}'.format(s3_base_path, table)

                # Generate COPY command:
                copy_command = copy_statement(table, s3_location, rs_iam_role, '|')

                # Load Data:
                copy_response = run_query(rs_cluster=input_rs_cluster_name,
                                          rs_db_name=input_rs_db_name,
                                          db_user=input_rs_username,
                                          sql_input=copy_command)

                # Temporary print:
                print(copy_response)

        except Exception as e:
            print('SQL execution error: {}'.format(e))
            traceback.print_exc()
