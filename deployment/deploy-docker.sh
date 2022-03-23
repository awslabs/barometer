#!/bin/bash
if [ -z "$1" ]
then
    echo "No argument supplied. Please pass argument 'deploy' or 'wizard'"
    echo "You can also mount your aws config by passing volume switch (-v) or directly setting environment variable as shown below"
    echo "Usage: docker run <image> -it -v ~/.aws:/root/.aws deploy"
    echo "Usage: docker run <image> -it -v ~/.aws:/root/.aws -v ./benchmarking-config.json:/build/cli-wizard/benchmarking-config.json wizard"
    echo "Usage: docker run <image> -it -e AWS_REGION=eu-west-1 -e AWS_ACCESS_KEY_ID=my-key -e AWS_SECRET_ACCESS_KEY=secret -e AWS_SESSION_TOKEN=my-token deploy"
    echo "Usage: docker run <image> -it -e AWS_REGION=eu-west-1 -e AWS_ACCESS_KEY_ID=my-key -e AWS_SECRET_ACCESS_KEY=secret -e AWS_SESSION_TOKEN=my-token wizard"
fi
if [[ $1 == "deploy" ]]; then
  cd /build/cdk-stack && cdk deploy
else
  if [[ $1 == "wizard" ]]; then
    cd /build/cli-wizard && npm run wizard
  fi
fi