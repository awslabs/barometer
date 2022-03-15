FROM public.ecr.aws/lambda/java:8.al2
COPY target/classes ${LAMBDA_TASK_ROOT}
COPY target/dependency/* ${LAMBDA_TASK_ROOT}/lib/

# Entry point for lambda function
CMD [ "com.aws.benchmarking.jdbcqueryrunner.Handler::handleRequest" ]