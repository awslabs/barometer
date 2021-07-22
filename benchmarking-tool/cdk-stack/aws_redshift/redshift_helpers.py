import boto3
import time
import traceback
import json


def run_query(rs_cluster, rs_db_name, db_user, sql_input, aws_region='eu-west-1'):
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
        print('SQL execution error: {}'.format(e))
        traceback.print_exc()

    else:
        return redshift_response_status['Status']


def copy_statement(table_name, s3_path, iam_role, col_delimiter, compupdate='ON', max_error=10):
    """
    Example:
        copy region
        from 's3://tpch-lab-reusable-asset/_temporary/'
        iam_role 'arn:aws:iam::123456789012:role/cdk-redshift-cluster-redshiftbenchmarktooliamrole4-hjkntJIJHBG'
        delimiter '|' COMPUPDATE ON maxerror 20;

    """
    copy_cmd = "copy {} from '{}' iam_role '{}' delimiter '{}' compupdate {} maxerror {}".\
        format(table_name, s3_path, iam_role, col_delimiter, compupdate, max_error)

    return copy_cmd


def find_keys_in_dict(input_dict, input_key_value):
    """
    Searches the KEY element, in the DICTIONARY. Source: https://bit.ly/3hkrwrm

    :param input_dict: dictionary where to search
    :param input_key_value: the string to look in the KEY names
    :return: dictionary with results
    """
    if isinstance(input_dict, list):
        for i in input_dict:
            for x in find_keys_in_dict(i, input_key_value):
                yield x
    elif isinstance(input_dict, dict):
        if input_key_value in input_dict:
            yield input_dict[input_key_value]
        for j in input_dict.values():
            for x in find_keys_in_dict(j, input_key_value):
                yield x


def get_products(region, service_code, instance_type, term='OnDemand'):
    """
    Calls AWS Pricing API, to get the cost per resource deployed

    :param region: non-standard region ID; e.g. EU (Ireland)
    :param service_code: call the service-quotas to get the service code; e.g. aws service-quotas list-services => elasticmapreduce, redshift, etc.
    :param instance_type: check for the types in the official docs; e.g. dc2.large (Redshift)
    :param term: OnDemand or Reserved
    :return: price (number) for specific product and configuration
    """

    # Calling Pricing API. Regions: us-east-1 or ap-south-1 only.
    pricing_client = boto3.client('pricing', region_name='us-east-1')

    try:
        response_iterator = pricing_client.get_products(
            ServiceCode=service_code,
            Filters=[
                {
                    'Type': 'TERM_MATCH',
                    'Field': 'location',
                    'Value': region
                },
                {
                    'Type': 'TERM_MATCH',
                    'Field': 'instanceType',
                    'Value': instance_type
                },
                {
                    'Type': 'TERM_MATCH',
                    'Field': 'usagetype',
                    'Value': 'EU-Node:{}'.format(instance_type)
                }
            ]
        )

        # Filtering pricing list
        price_list = response_iterator['PriceList']
        price_item = json.loads(price_list[0])

        # Filtering term; e.g. on-demand or reserved pricing
        price_term = price_item['terms'][term]

        # Filtering price and unit; e.g. $5.00 per hour
        price_dimension = list(find_keys_in_dict(price_term, 'priceDimensions'))
        price_product_filter = list(find_keys_in_dict(price_dimension, 'pricePerUnit'))[0]
        price_units = list(find_keys_in_dict(price_dimension, 'unit'))[0]
        price_description = list(find_keys_in_dict(price_dimension, 'description'))[0]

        # Appending info to product:
        price_product_filter['price_units'] = price_units
        price_product_filter['price_description'] = price_description
        price_product = json.dumps(price_product_filter)

    except Exception as e:
        print('SQL execution error: {}'.format(e))
        traceback.print_exc()

    else:
        return price_product


def get_cluster_details(rs_cluster_name, aws_region='eu-west-1'):
    """
    :param rs_cluster_name: ClusterIdentifier (string)
    The unique identifier of a cluster whose properties you are requesting.
    This parameter is case sensitive.

    :param aws_region: (string)

    :return: dict
    """

    # AWS settings
    redshift_client = boto3.client('redshift', region_name=aws_region)

    try:
        rs_response = redshift_client.describe_clusters(
            ClusterIdentifier=rs_cluster_name
        )

    except Exception as e:
        print('Error on collecting Redshift metadata: {}'.format(e))
        traceback.print_exc()

    else:
        return rs_response
