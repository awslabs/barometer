import boto3
from airflow import DAG
from datetime import timedelta
from airflow.utils.dates import days_ago
from airflow.operators.python_operator import PythonOperator

# Input Parameters
database_name = 'dev'

# Airflow Arguments:
default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5)
}

# SQL Query sample:
sql_1 = 'select acknowledge from test_connection'
sql_2 = 'select acknowledge+2 as ack_renamed from test_connection'


def run_query(sql_input):
    # AWS settings
    redshift_client = boto3.client('redshift-data', region_name='eu-west-1')

    # Run Redshift query
    redshift_response = redshift_client.execute_statement(
        ClusterIdentifier='data-benchmarking-redshift-cluster-1',
        Database=database_name,
        SecretArn='arn:aws:secretsmanager:eu-west-1:862990518977:secret:/dev-1/data-benchmarking-redshift-cluster-1-2vRvAG',
        Sql=sql_input,
        StatementName='TPCH SQL Query'
    )


# Run query 1:
def run_query_1():
    run_query(sql_1)


# Run query 2:
def run_query_2():
    run_query(sql_2)


with DAG(
    dag_id='run-redshift-sql-dag',
    default_args=default_args,
    dagrun_timeout=timedelta(hours=2),
    start_date=days_ago(2),
    schedule_interval='*/5 * * * *',
    tags=['redshift'],
) as dag:
    run_query_1 = PythonOperator(
        task_id='Run_Query_1',
        python_callable=run_query_1
    )

    run_query_2 = PythonOperator(
        task_id='Run_Query_2',
        python_callable=run_query_2
    )

run_query_1 >> run_query_2
