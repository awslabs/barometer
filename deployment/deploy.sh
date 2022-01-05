if ! hash mvn npm aws cdk jq zip &>/dev/null
then
 echo "==> [FAILED] All required prerequisites not found. Please ensure that below tools are installed & available in current bash environment. Exiting."
 echo "=> mvn (with jdk 8 or higher) https://maven.apache.org/install.html"
 echo "=> npm https://docs.npmjs.com/downloading-and-installing-node-js-and-npm"
 echo "=> aws cdk (npm install -g aws-cdk)"
 echo "=> aws-cli https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
 echo "=> jq https://stedolan.github.io/jq/download/"
 echo "=> zip (sudo apt install zip / yum install zip)"
 exit 1
fi
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
export AWS_REGION=$CDK_DEPLOY_REGION
aws_user=$(aws sts get-caller-identity | jq -r .UserId)
echo "==> [Progress 1/9] Using AWS user $aws_user"
echo "==> [Progress 1/9] Building JDBC function"
cd ../source/cdk-stack/common-functions/jdbc-query-runner
mvn clean install
cd ../..
echo "==> [Progress 2/9] Building Infrastructure"
npm install
echo "==> [Progress 3/9] Bootstrapping CDK stack if not done already"
TOOLKIT_STACK_NAME=$(aws cloudformation describe-stacks --stack-name CDKToolkit | jq -r ".Stacks[0].StackName")
if test -z "$TOOLKIT_STACK_NAME"
then
echo "==> [Progress 3/9] Bootstrapping CDK stack as CDKToolkit stack not found for region $AWS_REGION"
cdk bootstrap
fi
echo "==> [Progress 4/9] Deploying Infrastructure "
cdk deploy BenchmarkingStack
DATA_BUCKET=$(aws cloudformation describe-stacks --stack-name BenchmarkingStack | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "DataBucketName") | .OutputValue')
if test -z "$DATA_BUCKET"
then
  echo "==> [FAILED] Failed to fetch DATA_BUCKET from cloudformation stack. Try re-running ./deploy.sh"
  exit 1
fi
echo "==> [Progress 5/9] Data bucket is $DATA_BUCKET. Zipping all lambda function source-code"
for p in platforms/*/; do
  for f in "${p}"functions/*/; do
    echo "==> zipping function from path: $f"
    rm "$f"code.zip
    zip -r -j "$f"code.zip "$f"*
  done
done
echo "==> [Progress 6/9] Syncing platforms folder to s3://$DATA_BUCKET/platforms"
aws s3 sync platforms "s3://$DATA_BUCKET/platforms"
echo "==> [Progress 7/9] Syncing workloads folder to s3://$DATA_BUCKET/workloads"
aws s3 sync workloads "s3://$DATA_BUCKET/workloads"
echo "==> [Progress 8/9] Uploading TPC-DS Tools"
aws s3 cp ../tools/tpc-ds/TPC-DSGen-software-code-3.2.0rc1.zip "s3://$DATA_BUCKET/tools/TPC-DSGen-software-code-3.2.0rc1.zip"
aws s3 cp ../tools/tpc-ds/ddl.sql "s3://$DATA_BUCKET/datasets/tpc-ds-v3/ddl/ddl.sql"
aws s3 sync ../tools/tpc-ds/queries "s3://$DATA_BUCKET/datasets/tpc-ds-v3/benchmarking-queries"
echo "==> [Progress 9/9] Building cli-wizard"
cd ../cli-wizard
npm install && npm run build
echo "==> [MANUAL STEP] Please setup cost allocation tag using this link: https://console.aws.amazon.com/billing/home#/tags"
echo "==> Steps Are"
echo "==>   1. Select 'AWS-generated cost allocation tags' tab"
echo "==>   2. Select box with tag key 'aws:cloudformation:stack-name' & click 'Activate'"
echo "==> [SUCCESS] Benchmarking Tool is ready for running experiments. You can follow [MANUAL STEP] anytime before/after running experiments."
