import boto3

# AWS settings
redshift_client = boto3.client('redshift-data', region_name='eu-west-1')

# SQL Query sample:
sql_1 = 'select acknowledge from test_connection'

# Redshift query
redshift_response = redshift_client.execute_statement(
    ClusterIdentifier='tpch-redshift-cluster-1',
    Database='dev',
    SecretArn='arn:aws:secretsmanager:eu-west-1:862990518977:secret:tpch/tpch-redshift-cluster-1-hOYMWX',
    Sql=sql_1,
    StatementName='string'
)

# Print response, which is not the Data being queried.
# - Note: If you want to return the query results, use the get_statement_result method (same class: RedshiftDataAPIService.Client).
print(redshift_response)
