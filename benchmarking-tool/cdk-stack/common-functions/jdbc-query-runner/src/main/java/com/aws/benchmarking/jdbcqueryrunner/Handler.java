package com.aws.benchmarking.jdbcqueryrunner;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.AmazonS3URI;
import com.amazonaws.util.IOUtils;

import java.io.InputStream;
import java.sql.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class Handler implements RequestHandler<Map<String, String>, JdbcLambdaResponse> {

    AmazonS3 amazonS3 = AmazonS3ClientBuilder.defaultClient();

    static {
        // Load all the driver classes
        try {
            Class.forName("com.aws.benchmarking.jdbcqueryrunner.drivers.AWSSecretsManagerDriverRedshift");
            Class.forName("com.amazonaws.secretsmanager.sql.AWSSecretsManagerMariaDBDriver");
            Class.forName("com.amazonaws.secretsmanager.sql.AWSSecretsManagerMSSQLServerDriver");
            Class.forName("com.amazonaws.secretsmanager.sql.AWSSecretsManagerMySQLDriver");
            Class.forName("com.amazonaws.secretsmanager.sql.AWSSecretsManagerOracleDriver");
            Class.forName("com.amazonaws.secretsmanager.sql.AWSSecretsManagerPostgreSQLDriver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    @Override
    public JdbcLambdaResponse handleRequest(Map<String, String> event, Context context) {
        LambdaLogger logger = context.getLogger();
        String secretId = event.get("secretId");
        String scriptPath = event.get("scriptPath");
        JdbcLambdaResponse response = new JdbcLambdaResponse();
        response.setScriptPath(scriptPath);
        response.setSecretId(secretId);
        response.setMetrics(new HashMap<>());

        // Set secret id as user
        Properties userInfo = new Properties();
        userInfo.setProperty("user", secretId);

        String query;
        try {
            AmazonS3URI uri = new AmazonS3URI(scriptPath);
            InputStream inputStream = amazonS3.getObject(uri.getBucket(), uri.getKey()).getObjectContent();
            query = IOUtils.toString(inputStream);

            logger.log("Fetched script: " + scriptPath);
            logger.log("Executing using user: " + secretId);
            try (Connection connection = DriverManager.getConnection(secretId, userInfo);
                 Statement statement = connection.createStatement()) {
                // Execute query
                long startTimeMillis = System.currentTimeMillis();
                boolean hasResults = statement.execute(query);
                long timeTaken = System.currentTimeMillis() - startTimeMillis;
                response.getMetrics().put("runTimeMillis", timeTaken);
                response.getMetrics().put("hasResults", (hasResults ? 1L : 0L));
                if (hasResults) {
                    ResultSet resultSet = statement.getResultSet();
                    response.getMetrics().put("rowDeleted", (resultSet.rowDeleted() ? 1L : 0L));
                    response.getMetrics().put("rowInserted", (resultSet.rowInserted() ? 1L : 0L));
                    response.getMetrics().put("rowUpdated", (resultSet.rowUpdated() ? 1L : 0L));
                }
                logger.log("Time taken by the script " + scriptPath + " is " + timeTaken + " ms.");
            }
        } catch (Exception e) {
            logger.log(e.getMessage());
            e.printStackTrace();
            throw new RuntimeException(e.getMessage(), e);
        }

        return response;
    }
}
