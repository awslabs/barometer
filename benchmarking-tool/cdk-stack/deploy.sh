if test -z "$CDK_DEPLOY_ACCOUNT"
then
  echo "==> [FAILED] Environment variable CDK_DEPLOY_ACCOUNT not set. Exiting."
  exit 1
fi
if test -z "$CDK_DEPLOY_REGION"
then
  echo "==> [FAILED] Environment variable CDK_DEPLOY_REGION not set. Exiting."
  exit 1
fi
echo "==> [Progress 1/7] Building JDBC function"
cd ./common-functions/jdbc-query-runner
mvn clean install
cd ../..
echo "==> [Progress 2/7] Building Infrastructure"
npm install
echo "==> [Progress 3/7] Bootstrapping CDK stack if not done already"
TOOLKIT_STACK_NAME=$(aws cloudformation describe-stacks --stack-name CDKToolkit | jq -r ".Stacks[0].StackName")
if test -z "$TOOLKIT_STACK_NAME"
then
cdk bootstrap
fi
echo "==> [Progress 4/7] Deploying Infrastructure "
cdk deploy BenchmarkingStack
DATA_BUCKET=$(aws cloudformation describe-stacks --stack-name BenchmarkingStack | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "DataBucketName") | .OutputValue')
if test -z "$DATA_BUCKET"
then
  echo "==> [FAILED] Failed to fetch DATA_BUCKET from cloudformation stack. Try re-running ./deploy.sh"
  exit 1
fi
echo "==> [Progress 5/7] Data bucket is $DATA_BUCKET. Zipping all lambda function source-code"
for p in platforms/*/; do
  for f in "${p}"functions/*/; do
    echo "==> zipping function from path: $f"
    rm "$f"code.zip
    zip -r -j "$f"code.zip "$f"*
  done
done
echo "==> [Progress 6/7] Syncing platforms folder to s3://$DATA_BUCKET/platforms"
aws s3 sync platforms "s3://$DATA_BUCKET/platforms"
echo "==> [Progress 7/7] Syncing workloads folder to s3://$DATA_BUCKET/platforms"
aws s3 sync workloads "s3://$DATA_BUCKET/workloads"
echo "==> [MANUAL STEP] Please setup cost allocation tag using this link: https://console.aws.amazon.com/billing/home#/tags"
echo "==> Steps Are"
echo "==>   1. Select 'AWS-generated cost allocation tags' tab"
echo "==>   2. Select box with tag key 'aws:cloudformation:stack-name' & click 'Activate'"
echo "==> [SUCCESS] Benchmarking Tool is ready for running experiments. You can follow [MANUAL STEP] anytime before/after running experiments."
