@echo off
if defined CDK_DEPLOY_ACCOUNT (
	if defined CDK_DEPLOY_REGION (
		set "AWS_REGION=%CDK_DEPLOY_REGION%"
		echo "==> [Progress 1/9] Building JDBC function"
		cd ../source/cdk-stack/common-functions/jdbc-query-runner
		call mvn clean install
		cd ../..
		echo "==> [Progress 2/9] Building Infrastructure"
		call npm install
		echo "==> [Progress 3/9] Bootstrapping CDK stack if not done already"
		FOR /F "tokens=* USEBACKQ" %%a IN (`aws cloudformation describe-stacks --stack-name CDKToolkit ^| jq -r ".Stacks[0].StackName"`) DO (
			SET "TOOLKIT_STACK_NAME=%%a"
			goto :cdk_toolkit_next
		)
		:cdk_toolkit_next
		if not defined TOOLKIT_STACK_NAME (
			echo "==> [Progress 3/9] Bootstrapping CDK stack as CDKToolkit stack not found for region %AWS_REGION%"
			call cdk bootstrap
		)
		echo "==> [Progress 4/9] Deploying Infrastructure "
		call cdk deploy BenchmarkingStack
		FOR /F "tokens=* USEBACKQ" %%b IN (`aws cloudformation describe-stacks --stack-name BenchmarkingStack ^| jq -r ".Stacks[0].Outputs[] | select(.OutputKey == \"DataBucketName\") | .OutputValue"`) DO (
			SET "DATA_BUCKET=%%b"
			goto :data_bucket_next
		)
		:data_bucket_next
		if not [%DATA_BUCKET%] == [] (
			echo "==> [Progress 5/9] Data bucket is %DATA_BUCKET%. Zipping all lambda function source-code"
			for /d %%D in (platforms/*) do (
				for /d %%K in (platforms/%%~D/functions/*) do (
					del platforms/%%~D/functions/%%~K/code.zip
					call jar -cvfM code.zip -C platforms/%%~D/functions/%%~K .
					move /Y code.zip  platforms/%%~D/functions/%%~K/code.zip
				)
			)
			echo "==> [Progress 6/9] Syncing platforms folder to s3://%DATA_BUCKET%/platforms"
			call aws s3 sync platforms "s3://%DATA_BUCKET%/platforms"
			echo "==> [Progress 7/9] Syncing workloads folder to s3://%DATA_BUCKET%/platforms"
			call aws s3 sync workloads "s3://%DATA_BUCKET%/workloads"
			echo "==> [Progress 8/9] Uploading TPC-DS Tools"
			call aws s3 cp ../tools/tpc-ds/TPC-DSGen-software-code-3.2.0rc1.zip "s3://%DATA_BUCKET%/tools/TPC-DSGen-software-code-3.2.0rc1.zip"
            call aws s3 cp ../tools/tpc-ds/ddl.sql "s3://%DATA_BUCKET%/datasets/tpc-ds-v3/ddl/ddl.sql"
            call aws s3 sync ../tools/tpc-ds/queries "s3://%DATA_BUCKET%/datasets/tpc-ds-v3/benchmarking-queries"
			echo "==> [Progress 9/9] Building cli-wizard"
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