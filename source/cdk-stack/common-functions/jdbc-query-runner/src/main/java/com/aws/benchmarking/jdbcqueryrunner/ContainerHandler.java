package com.aws.benchmarking.jdbcqueryrunner;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import com.amazonaws.services.s3.model.S3ObjectSummary;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class ContainerHandler {
    private static final AmazonS3 amazonS3 = AmazonS3ClientBuilder.defaultClient();

    public static void main(String[] args) throws Exception {

        // Read all environment variables
        String secretId = Objects.requireNonNull(System.getenv("secretId"), "secretId environment variable not set.");
        String sessionId = Objects.requireNonNull(System.getenv("sessionId"), "sessionId environment variable not set.");
        String stackName = Objects.requireNonNull(System.getenv("stackName"), "stackName environment variable not set.");
        String basePath = Objects.requireNonNull(System.getenv("basePath"), "basePath environment variable not set.");
        String extension = Objects.requireNonNull(System.getenv("extension"), "extension environment variable not set.");

        // Fetch list of .sql files from S3 bucket
        URI uri = new URI(basePath);
        String bucketName = uri.getHost();
        String prefix = uri.getPath().substring(1);
        ListObjectsV2Result result = amazonS3.listObjectsV2(bucketName, prefix);

        Handler handler = new Handler();
        for (S3ObjectSummary objectSummary : result.getObjectSummaries()) {
            if (objectSummary.getKey().toLowerCase().endsWith(extension.toLowerCase())) {
                Map<String, String> event = new HashMap<>();
                event.put("secretId", secretId);
                event.put("sessionId", sessionId);
                event.put("stackName", stackName);
                event.put("scriptPath", "s3://" + objectSummary.getBucketName() + "/" + objectSummary.getKey());
                handler.handleRequest(event, null);
            }
        }
    }
}
