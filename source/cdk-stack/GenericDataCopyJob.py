import json
import sys

import boto3
import json
from awsglue.context import GlueContext
from awsglue.job import Job
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext

secrets = boto3.client("secretsmanager")

engine_mapping = {
    "postgres": "postgresql"
}

## @params: [JOB_NAME]
args = getResolvedOptions(sys.argv, ["JOB_NAME", "SECRET_ID", "TABLE_DATA_PATH"])

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

secret_id = args["SECRET_ID"]
table_data_path = args["TABLE_DATA_PATH"]

response = json.loads(secrets.get_secret_value(SecretId=secret_id)["SecretString"])

df = spark.read.parquet(table_data_path)
table_name = table_data_path.split('/')[-2]

engine = response["engine"]
if engine in engine_mapping:
    engine = engine_mapping[response["engine"]]

df.write \
    .mode("overwrite") \
    .format("jdbc") \
    .option("url", "jdbc:" + engine + "://" + response["host"] +
            ":" + str(response["port"]) + "/" + response["dbname"]) \
    .option("dbtable", table_name) \
    .option("user", response["username"]) \
    .option("password", response["password"]) \
    .save()

job.commit()
