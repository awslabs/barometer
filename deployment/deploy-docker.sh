#!/bin/bash
if [ -z "$1" ]; then
  echo "No argument supplied. Please pass argument 'deploy' or 'wizard'"
  echo "You can also mount your aws config by passing volume switch (-v) or directly setting environment variable as shown below"
  echo "Usage: docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock -v ~/.aws:/root/.aws -e AWS_PROFILE=dev barometer deploy <region>"
  echo "Usage: docker run -it -v /var/run/docker.sock:/var/run/docker.sock -v ~/.aws:/root/.aws -v ~/storage:/build/cli-wizard/storage barometer wizard <region>"
  echo "Usage: docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock -e AWS_REGION=eu-west-1 -e AWS_ACCESS_KEY_ID=my-key -e AWS_SECRET_ACCESS_KEY=secret -e AWS_SESSION_TOKEN=my-token barometer deploy"
  echo "Usage: docker run -it -v /var/run/docker.sock:/var/run/docker.sock -e AWS_REGION=eu-west-1 -e AWS_ACCESS_KEY_ID=my-key -e AWS_SECRET_ACCESS_KEY=secret -e AWS_SESSION_TOKEN=my-token barometer wizard"
  exit 1
fi

export CDK_DEPLOY_ACCOUNT=$(aws sts get-caller-identity | jq -r ".Account")
export USER_ID=$(aws sts get-caller-identity | jq -r ".UserId")
if [ -z "$2" ]; then
  if [ -z "$AWS_REGION" ]; then
    echo "Usage: deploy <region>"
    echo "Usage: wizard <region>"
    exit 1
  else
    export CDK_DEPLOY_REGION=$AWS_REGION
  fi
else
  export CDK_DEPLOY_REGION=$2
fi

if [ -z "$CDK_DEPLOY_ACCOUNT" ]; then
  echo "Unable to fetch AWS Account ID to use. Please check your aws credentials/profile supplied"
  exit 1
fi

export AWS_REGION=$CDK_DEPLOY_REGION

if [[ $1 == "deploy" ]]; then
  cd /build/cdk-stack
  echo "==> Using user $USER_ID and AWS Account: $CDK_DEPLOY_ACCOUNT to deploy barometer in region: $CDK_DEPLOY_REGION"
  echo "==> [Progress 1/6] Bootstrapping CDK stack if not done already"
  TOOLKIT_STACK_NAME=$(aws cloudformation describe-stacks --stack-name CDKToolkit --region "$AWS_REGION" | jq -r ".Stacks[0].StackName")
  if test -z "$TOOLKIT_STACK_NAME"; then
    echo "==> [Progress 1/6] Bootstrapping CDK stack as CDKToolkit stack not found for region $CDK_DEPLOY_REGION"
    /build/node_modules/aws-cdk/bin/cdk bootstrap
  fi
  echo "==> [Progress 2/6] Deploying Infrastructure"
  /build/node_modules/aws-cdk/bin/cdk deploy BenchmarkingStack
  DATA_BUCKET=$(aws cloudformation describe-stacks --stack-name BenchmarkingStack --region "$AWS_REGION" | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "DataBucketName") | .OutputValue')
  MANIFEST_BUCKET=$(aws cloudformation describe-stacks --stack-name BenchmarkingStack --region "$AWS_REGION" | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "ManifestBucketName") | .OutputValue')
  if test -z "$DATA_BUCKET"; then
    echo "==> [FAILED] Failed to fetch DATA_BUCKET from cloudformation stack. Try re-running deploy"
    exit 1
  fi
  if test -z "$MANIFEST_BUCKET"; then
    echo "==> [FAILED] Failed to fetch MANIFEST_BUCKET from cloudformation stack. Try re-running deploy"
    exit 1
  fi
  echo "==> [Progress 3/6] Syncing platforms folder to s3://$DATA_BUCKET/platforms"
  aws s3 sync platforms "s3://$DATA_BUCKET/platforms" --region "$AWS_REGION"
  echo "==> [Progress 4/6] Syncing workloads folder to s3://$DATA_BUCKET/workloads"
  aws s3 sync workloads "s3://$DATA_BUCKET/workloads" --region "$AWS_REGION"
  echo "==> [Progress 5/6] Uploading TPC-DS Tools"
  aws s3 cp ../tools/tpc-ds/ddl.sql "s3://$DATA_BUCKET/datasets/tpc-ds-v2/ddl/ddl.sql" --region "$AWS_REGION"
  aws s3 sync ../tools/tpc-ds/queries "s3://$DATA_BUCKET/datasets/tpc-ds-v2/benchmarking-queries" --region "$AWS_REGION"
  echo "==> [Progress 6/6] Uploading TPC-DS Dataset manifest files"
  aws s3 sync ../tools/tpc-ds/manifests/ "s3://$MANIFEST_BUCKET/tpc-ds-v2/" --region "$AWS_REGION"
  echo "==> [MANUAL STEP] Please setup cost allocation tag using this link: https://console.aws.amazon.com/billing/home#/tags"
  echo "==> Steps Are"
  echo "==>   1. Select 'AWS-generated cost allocation tags' tab"
  echo "==>   2. Select box with tag key 'aws:cloudformation:stack-name' & click 'Activate'"
  echo "==> [SUCCESS] Barometer is ready for running experiments. You can follow [MANUAL STEP] anytime before/after running experiments."
else
  if [[ $1 == "wizard" ]]; then
    cd /build/cli-wizard && node build/cli.js
  fi
fi
