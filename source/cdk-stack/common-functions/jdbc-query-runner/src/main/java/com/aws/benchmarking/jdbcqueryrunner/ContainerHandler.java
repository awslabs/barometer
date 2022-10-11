package com.aws.benchmarking.jdbcqueryrunner;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ContainerHandler {
    private static final AmazonS3 amazonS3 = AmazonS3ClientBuilder.defaultClient();
    private static final Gson GSON = new Gson();

    public static void main(String[] args) throws Exception {

        // Read all environment variables
        String secretId = Objects.requireNonNull(System.getenv("secretId"), "secretId environment variable not set.");
        List<String> sessionIds = GSON.fromJson(Objects.requireNonNull(System.getenv("sessionIds"), "sessionIds environment variable not set."), new TypeToken<List<String>>() {
        }.getType());
        String stackName = Objects.requireNonNull(System.getenv("stackName"), "stackName environment variable not set.");
        String basePath = Objects.requireNonNull(System.getenv("basePath"), "basePath environment variable not set.");
        String extension = Objects.requireNonNull(System.getenv("extension"), "extension environment variable not set.");
        String driverClass = Objects.requireNonNull(System.getenv("driverClass"), "driverClass environment variable not set.");

        // Fetch list of .sql files from S3 bucket
        URI uri = new URI(basePath);
        String bucketName = uri.getHost();
        String prefix = uri.getPath().substring(1);
        ListObjectsV2Result result = amazonS3.listObjectsV2(bucketName, prefix);

        ExecutorService executorService = Executors.newFixedThreadPool(sessionIds.size());
        for (String sessionId : sessionIds) {
            executorService.submit(() -> {
                try {
                    Handler handler = new Handler();
                    System.out.println("Started thread for user session: " + sessionId);
                    for (S3ObjectSummary objectSummary : result.getObjectSummaries()) {
                        if (objectSummary.getKey().toLowerCase().endsWith(extension.toLowerCase())) {
                            Map<String, String> event = new HashMap<>();
                            event.put("secretId", secretId);
                            event.put("driverClass", driverClass);
                            event.put("sessionId", sessionId);
                            event.put("stackName", stackName);
                            event.put("scriptPath", "s3://" + objectSummary.getBucketName() + "/" + objectSummary.getKey());
                            handler.handleRequest(event, null);
                        }
                    }
                    System.out.println("Completed thread for user session: " + sessionId);
                } catch (Exception e) {
                    e.printStackTrace();
                    throw e;
                }
            });
        }
        executorService.shutdown();
    }
}
