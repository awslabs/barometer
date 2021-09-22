set PATH=%PATH%;D:\software\apache-maven-3.8.2\bin;D:\software\node-v14.17.6-win-x86;D:\software;c:\Users\annshah\AppData\Roaming\Python\Python38\Scripts
set CDK_DEPLOY_ACCOUNT=585388894621
set CDK_DEPLOY_REGION=eu-west-1
@echo off
if defined CDK_DEPLOY_ACCOUNT (
	if defined CDK_DEPLOY_REGION (
		set AWS_REGION=%CDK_DEPLOY_REGION%
		echo "==> [Progress 1/8] Building JDBC function"
		cd ./cdk-stack/common-functions/jdbc-query-runner
		call mvn clean install
		cd ../..
		echo "==> [Progress 2/8] Building Infrastructure"
		call npm install
		echo "==> [Progress 3/8] Bootstrapping CDK stack if not done already"
		FOR /F "tokens=* USEBACKQ" %%F IN (`aws cloudformation describe-stacks --stack-name CDKToolkit ^| jq -r ".Stacks[0].StackName"`) DO (
			SET TOOLKIT_STACK_NAME=%%F
		)
		if not defined TOOLKIT_STACK_NAME (
			echo "==> [Progress 3/8] Bootstrapping CDK stack as CDKToolkit stack not found for region %AWS_REGION%"
			call cdk bootstrap
		)
		echo "==> [Progress 4/8] Deploying Infrastructure "
		call cdk deploy BenchmarkingStack
		FOR /F "tokens=* USEBACKQ" %%A IN (`aws cloudformation describe-stacks --stack-name BenchmarkingStack ^| jq -r ".Stacks[0].Outputs[] | select(.OutputKey == \"DataBucketName\") | .OutputValue"`) DO (
			SET DATA_BUCKET=%%A
		)
		if defined DATA_BUCKET (
			echo "==> [Progress 5/8] Data bucket is %DATA_BUCKET%. Zipping all lambda function source-code"
			for /d %%D in (platforms/*) do (
				for /d %%K in (platforms/%%~D/functions/*) do (
					del platforms/%%~D/functions/%%~K/code.zip
					call jar -cvfM code.zip -C platforms/%%~D/functions/%%~K .
					move /Y code.zip  platforms/%%~D/functions/%%~K/code.zip
				)
			)
			echo "==> [Progress 6/8] Syncing platforms folder to s3://%DATA_BUCKET%/platforms"
			call aws s3 sync platforms "s3://%DATA_BUCKET%/platforms"
			echo "==> [Progress 7/8] Syncing workloads folder to s3://%DATA_BUCKET%/platforms"
			call aws s3 sync workloads "s3://%DATA_BUCKET%/workloads"
			echo "==> [Progress 8/8] Building cli-wizard"
			cd ../cli-wizard
			call npm install && npm run build
			echo "==> [MANUAL STEP] Please setup cost allocation tag using this link: https://console.aws.amazon.com/billing/home#/tags"
			echo "==> Steps Are"
			echo "==>   1. Select 'AWS-generated cost allocation tags' tab"
			echo "==>   2. Select box with tag key 'aws:cloudformation:stack-name' & click 'Activate'"
			echo "==> [SUCCESS] Benchmarking Tool is ready for running experiments. You can follow [MANUAL STEP] anytime before/after running experiments."
		) else (
			echo "==> [FAILED] Failed to fetch DATA_BUCKET from cloudformation stack. Try re-running ./deploy.bat"
		)
	) else (
		echo "==> [FAILED] Environment variable CDK_DEPLOY_REGION not set. Exiting."
	)
) else (
	echo "==> [FAILED] Environment variable CDK_DEPLOY_ACCOUNT not set. Exiting."
)