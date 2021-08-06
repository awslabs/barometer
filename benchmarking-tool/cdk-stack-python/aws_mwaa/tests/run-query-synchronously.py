import boto3
import traceback
import time
import itertools
import threading
import sys

# Testing long-running queries sequentially:
sql_dir = 'C:\\Users\\carcarre\\Documents\\Projects\\Reusable Assets\\TPCH_Benchmark_Redshift_v1\\src\\data-benchmark-prototyping-solution\\src\\aws-mwaa\\tests\\tpch-sql\\'
sql_1_file = '{}query_{}.sql'.format(sql_dir, '18')
sql_2_file = '{}query_{}.sql'.format(sql_dir, '21')

# Fetching queries:
sql_1_query = open(sql_1_file).read()
sql_2_query = open(sql_2_file).read()

# Input Parameters
database_name = 'tpchdb_100gb_dataset'
redshift_cluster_name = 'data-benchmarking-redshift-cluster-1'
secret_arn_redshift_credentials = 'arn:aws:secretsmanager:eu-west-1:862990518977:secret:/dev-1/data-benchmarking-redshift-cluster-1-2vRvAG'


def run_query(sql_input):
    # AWS settings
    redshift_client = boto3.client('redshift-data', region_name='eu-west-1')

    try:
        # Run Redshift query
        redshift_response_run = redshift_client.execute_statement(
            ClusterIdentifier=redshift_cluster_name,
            Database=database_name,
            SecretArn=secret_arn_redshift_credentials,
            Sql=sql_input,
            StatementName='TPCH SQL Query'
        )

        # The Redshift Data API takes around a second, to return the query id:
        time.sleep(2)

        # Check for query status:
        redshift_response_status = redshift_client.describe_statement(
            Id=redshift_response_run['Id']
        )

        # Wait for query to finish:
        print('Running SQL query...')
        while redshift_response_status['Status'] == 'STARTED':
            redshift_response_status = redshift_client.describe_statement(
                Id=redshift_response_run['Id']
            )
            time.sleep(2)

    except:
        print('SQL execution error!')
        traceback.print_exc()
    finally:
        return (redshift_response_status)


# Running queries:
run_query(sql_1_query)
run_query(sql_2_query)

