cd ./common-functions/jdbc-query-runner
mvn clean install
cd ../..
cdk diff BenchmarkingStack
cdk deploy BenchmarkingStack
DATA_BUCKET=$(aws cloudformation describe-stacks --stack-name BenchmarkingStack | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "DataBucketName") | .OutputValue')
aws s3 sync platforms "s3://$DATA_BUCKET/platforms"
aws s3 sync workloads "s3://$DATA_BUCKET/workloads"
