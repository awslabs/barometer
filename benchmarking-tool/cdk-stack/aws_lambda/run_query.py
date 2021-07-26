import boto3
import time
import traceback


def lambda_handler(event, context):
    # Calling function to execute input; i.e. SQL statement against Redshift DB
    query_output = run_query(rs_cluster=event['rs_cluster'], rs_db_name=event['rs_db_name'], db_user=event['db_user'], sql_input=event['sql_input'])

    # Return query status:
    return query_output


def run_query(rs_cluster, rs_db_name, db_user, sql_input, sync_exec=False, aws_region='eu-west-1'):
    """
    function to execute an SQL statement, against a Redshift cluster

    rs_cluster: str
        Redshift cluster name only. Not the entire endpoint string

    db_user: str
        User to connect. Password not required, since Temporary Credentials
        method will be used

    sql_input: str
        SQL Statement, compatible with Amazon Redshift
    """

    # AWS settings
    redshift_client = boto3.client('redshift-data', region_name=aws_region)

    try:
        # Run Redshift query; Secrets Manager is also compatible.
        redshift_response_run = redshift_client.execute_statement(
            ClusterIdentifier=rs_cluster,
            Database=rs_db_name,
            DbUser=db_user,
            Sql=sql_input,
            StatementName='SQL Query'
        )

        """
        Check for query status:
           To fix: 
           - The Redshift Data API takes around a second, to return the query id. 
             Before such time, it fails with exception. For now, we (temporarilly) add 2 seconds which seemed stable in testing.
        """
        time.sleep(2)
        redshift_response_status = redshift_client.describe_statement(
            Id=redshift_response_run['Id']
        )

        if sync_exec:
            # Sync execution: waiting for query to finish.
            #   Note: to consider Lambda timeout
            print('Running SQL query: \n {}'.format(sql_input))
            while redshift_response_status['Status'] == 'STARTED':
                redshift_response_status = redshift_client.describe_statement(
                    Id=redshift_response_run['Id']
                )
                time.sleep(1)

    except Exception as e:
        print('SQL execution error: {}'.format(e))
        traceback.print_exc()

    else:
        return {
            'query_submitted_status': redshift_response_status['Status']
        }
