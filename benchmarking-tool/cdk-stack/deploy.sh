echo "Building JDBC function"
cd ./common-functions/jdbc-query-runner
mvn clean install
cd ../..
echo "Deploying Infrastructure"
cdk deploy BenchmarkingStack
DATA_BUCKET=$(aws cloudformation describe-stacks --stack-name BenchmarkingStack | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "DataBucketName") | .OutputValue')
echo "Data bucket is $DATA_BUCKET"
for p in platforms/*/; do
  for f in "${p}"functions/*/; do
    echo "zipping function from path: $f"
    rm "$f"code.zip
    zip -r -j "$f"code.zip "$f"*
  done
done
echo "Syncing platforms folder to s3://$DATA_BUCKET/platforms"
aws s3 sync platforms "s3://$DATA_BUCKET/platforms"
echo "Syncing workloads folder to s3://$DATA_BUCKET/platforms"
aws s3 sync workloads "s3://$DATA_BUCKET/workloads"
echo "All done"
