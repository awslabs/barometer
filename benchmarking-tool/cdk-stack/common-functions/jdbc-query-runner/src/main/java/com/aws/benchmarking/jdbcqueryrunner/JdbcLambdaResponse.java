package com.aws.benchmarking.jdbcqueryrunner;

import java.util.Map;

public class JdbcLambdaResponse {
    private String secretId;
    private String scriptPath;
    private Map<String, Long> metrics;

    public String getSecretId() {
        return secretId;
    }

    public void setSecretId(String secretId) {
        this.secretId = secretId;
    }

    public String getScriptPath() {
        return scriptPath;
    }

    public void setScriptPath(String scriptPath) {
        this.scriptPath = scriptPath;
    }

    public Map<String, Long> getMetrics() {
        return metrics;
    }

    public void setMetrics(Map<String, Long> metrics) {
        this.metrics = metrics;
    }
}
