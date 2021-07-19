import boto3
import time
import traceback
from airflow import DAG
from datetime import timedelta, datetime
from airflow.operators.python_operator import PythonOperator

# Input Parameters
database_name = 'tpchdb_100gb_dataset'
redshift_cluster_name = 'data-benchmarking-redshift-cluster-1'
secret_arn_redshift_credentials = 'arn:aws:secretsmanager:eu-west-1:862990518977:secret:/dev-1/data-benchmarking-redshift-cluster-1-2vRvAG'
sql_dir = '/usr/local/airflow/dags/tpch-sql/'
etl_concurrency = 2
etl_max_active_runs = 2

# Airflow Arguments:
default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5)
}

# Init vars, for dictionary in next step:
queries_dict = {}
key = 1

while key < 23:
    # Building dictionary with the 22 official TPC-H queries:
    # - e.g. {"sql_1": "select x from foo", "sql_2": "select ..."}
    sql_file = '{}query_{}.sql'.format(sql_dir, key)
    sql_query = open(sql_file).read()
    key_dict = 'sql_{}'.format(key)
    queries_dict[key_dict] = sql_query
    key += 1


# Define connection method against DB:
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
        print('Running SQL query: \n {}'.format(sql_input))
        while redshift_response_status['Status'] == 'STARTED':
            redshift_response_status = redshift_client.describe_statement(
                Id=redshift_response_run['Id']
            )
            time.sleep(2)

    except Exception as e:
        print('SQL Execution error: {}'.format(e))
        traceback.print_exc()

    else:
        # The response may include when the query started, when it finished, the query status, the number of rows returned, and the SQL statement.
        # In this case, we return the status only.
        return redshift_response_status['Status']


with DAG(
    dag_id='run-redshift-tpch-queries',
    default_args=default_args,
    dagrun_timeout=timedelta(hours=2),
    start_date=datetime(2021, 7, 15, 13, 50, 00),
    schedule_interval='*/10 * * * *',
    concurrency=etl_concurrency,
    max_active_runs=etl_max_active_runs,
    tags=['redshift', 'data benchmark', 'EMEA Prototyping Labs'],
) as dag:
    run_query_1 = PythonOperator(
        task_id='Run_Query_1',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_1']}
    )

    run_query_2 = PythonOperator(
        task_id='Run_Query_2',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_2']}
    )

    run_query_3 = PythonOperator(
        task_id='Run_Query_3',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_3']}
    )

    run_query_4 = PythonOperator(
        task_id='Run_Query_4',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_4']}
    )

    run_query_5 = PythonOperator(
        task_id='Run_Query_5',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_5']}
    )

    run_query_6 = PythonOperator(
        task_id='Run_Query_6',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_6']}
    )

    run_query_7 = PythonOperator(
        task_id='Run_Query_7',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_7']}
    )

    run_query_8 = PythonOperator(
        task_id='Run_Query_8',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_8']}
    )

    run_query_9 = PythonOperator(
        task_id='Run_Query_9',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_9']}
    )

    run_query_10 = PythonOperator(
        task_id='Run_Query_10',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_10']}
    )

    run_query_11 = PythonOperator(
        task_id='Run_Query_11',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_11']}
    )

    run_query_12 = PythonOperator(
        task_id='Run_Query_12',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_12']}
    )

    run_query_13 = PythonOperator(
        task_id='Run_Query_13',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_13']}
    )

    run_query_14 = PythonOperator(
        task_id='Run_Query_14',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_14']}
    )

    run_query_15 = PythonOperator(
        task_id='Run_Query_15',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_15']}
    )

    run_query_16 = PythonOperator(
        task_id='Run_Query_16',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_16']}
    )

    run_query_17 = PythonOperator(
        task_id='Run_Query_17',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_17']}
    )

    run_query_18 = PythonOperator(
        task_id='Run_Query_18',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_18']}
    )

    run_query_19 = PythonOperator(
        task_id='Run_Query_19',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_19']}
    )

    run_query_20 = PythonOperator(
        task_id='Run_Query_20',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_20']}
    )

    run_query_21 = PythonOperator(
        task_id='Run_Query_21',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_21']}
    )

    run_query_22 = PythonOperator(
        task_id='Run_Query_22',
        python_callable=run_query,
        op_kwargs={'sql_input': queries_dict['sql_22']}
    )

run_query_1 >> run_query_2 >> run_query_3 >> run_query_4 >> run_query_5 >> run_query_6
run_query_6 >> run_query_7 >> run_query_8 >> run_query_9 >> run_query_10 >> run_query_11 >> run_query_12
run_query_12 >> run_query_13 >> run_query_14 >> run_query_15 >> run_query_16 >> run_query_17 >> run_query_18
run_query_18 >> run_query_19 >> run_query_20 >> run_query_21 >> run_query_22
