package com.aws.benchmarking.jdbcqueryrunner;

import com.amazonaws.services.cloudwatch.AmazonCloudWatch;
import com.amazonaws.services.cloudwatch.AmazonCloudWatchClientBuilder;
import com.amazonaws.services.cloudwatch.model.Dimension;
import com.amazonaws.services.cloudwatch.model.MetricDatum;
import com.amazonaws.services.cloudwatch.model.PutMetricDataRequest;
import com.amazonaws.services.cloudwatch.model.StandardUnit;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.AmazonS3URI;
import com.amazonaws.util.IOUtils;

import java.io.InputStream;
import java.sql.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

public class Handler implements RequestHandler<Map<String, String>, JdbcLambdaResponse> {

    final AmazonS3 amazonS3 = AmazonS3ClientBuilder.defaultClient();
    final AmazonCloudWatch cloudWatch = AmazonCloudWatchClientBuilder.defaultClient();
    private static final Map<String, Connection> cachedConnections = new ConcurrentHashMap<>();

    @Override
    public JdbcLambdaResponse handleRequest(Map<String, String> event, Context context) {
        LambdaLogger logger = new LambdaLogger() {
            @Override
            public void log(String s) {
                System.out.println(s);
            }

            @Override
            public void log(byte[] bytes) {
                System.out.println(Arrays.toString(bytes));
            }
        };

        if (context != null)
            logger = context.getLogger();
        String connectionTest = event.get("connectionTest");
        String secretId = event.get("secretId");
        String scriptPath = event.get("scriptPath");
        String query = event.get("query");
        String stackName = event.get("stackName");
        String sessionId = event.get("sessionId");
        String driverClass = event.get("driverClass");

        JdbcLambdaResponse response = new JdbcLambdaResponse();
        response.setScriptPath(scriptPath);
        response.setSecretId(secretId);
        response.setSessionId(sessionId);
        response.setStackName(stackName);
        response.setMetrics(new HashMap<>());

        try {
            Class.forName(driverClass);
            if ("true".equalsIgnoreCase(connectionTest) && secretId != null) {
                getConnection(secretId, sessionId, logger);
                return response;
            }
            if (scriptPath != null) {
                AmazonS3URI uri = new AmazonS3URI(scriptPath);
                InputStream inputStream = amazonS3.getObject(uri.getBucket(), uri.getKey()).getObjectContent();
                query = IOUtils.toString(inputStream);
            }
            logger.log("Fetched script: " + scriptPath);
            logger.log("Executing using user: " + secretId);
            Connection connection = getConnection(secretId, sessionId, logger);
            try (Statement statement = connection.createStatement()) {
                // Execute query
                long startTimeMillis = System.currentTimeMillis();
                boolean hasResults = statement.execute(query);
                double timeTaken = System.currentTimeMillis() - startTimeMillis;
                response.getMetrics().put("runTimeMillis", timeTaken);
                response.getMetrics().put("hasResults", (hasResults ? 1d : 0d));
                if (hasResults) {
                    ResultSet resultSet = statement.getResultSet();
                    response.getMetrics().put("rowDeleted", (resultSet.rowDeleted() ? 1d : 0d));
                    response.getMetrics().put("rowInserted", (resultSet.rowInserted() ? 1d : 0d));
                    response.getMetrics().put("rowUpdated", (resultSet.rowUpdated() ? 1d : 0d));
                }
                publishMetrics(response);
                logger.log("Time taken by the script " + scriptPath + " is " + timeTaken + " ms.");
            }
        } catch (Exception e) {
            logger.log(e.getMessage());
            e.printStackTrace();
            throw new RuntimeException(e.getMessage(), e);
        }

        return response;
    }

    private static Connection getConnection(String secretId, String sessionId, LambdaLogger logger) throws SQLException {
        String cacheKey = secretId + "/" + sessionId;
        Connection cachedConnection = cachedConnections.get(cacheKey);
        try {
            if (cachedConnection != null && !cachedConnection.isClosed()) {
                return cachedConnection;
            }
            if (cachedConnection != null)
                cachedConnection.close();
        } catch (SQLException e) {
            logger.log("Can't reuse cachedConnection. Recreating - " + e.getMessage());
        }
        // Set secret id as user
        Properties userInfo = new Properties();
        userInfo.setProperty("user", secretId);
        cachedConnection = DriverManager.getConnection(secretId, userInfo);
        cachedConnections.put(cacheKey, cachedConnection);
        return cachedConnection;
    }

    private void publishMetrics(JdbcLambdaResponse response) {
        List<Dimension> dimensions = new ArrayList<>();
        dimensions.add(new Dimension().withName("SESSION_ID").withValue(response.getSessionId()));
        dimensions.add(new Dimension().withName("SECRET_ID").withValue(response.getSecretId()));
        dimensions.add(new Dimension().withName("STACK_NAME").withValue(response.getStackName()));
        String scriptPath = response.getScriptPath();
        dimensions.add(new Dimension().withName("SCRIPT_PATH").withValue(scriptPath == null ? "DIRECT_QUERY" : scriptPath));

        PutMetricDataRequest request = new PutMetricDataRequest()
                .withNamespace("Benchmarking")
                .withMetricData(response.getMetrics().entrySet().stream().map(entry -> new MetricDatum()
                                .withMetricName(entry.getKey())
                                .withUnit(StandardUnit.Milliseconds)
                                .withValue(entry.getValue())
                                .withDimensions(dimensions))
                        .collect(Collectors.toList()));

        cloudWatch.putMetricData(request);
    }
}
