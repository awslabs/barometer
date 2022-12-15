package com.aws.benchmarking.jdbcqueryrunner;

import java.util.Map;

public class JdbcLambdaResponse {
    private String secretId;
    private String scriptPath;
    private String query;
    private String sessionId;
    private String stackName;
    private String workloadconfigname;
    private String platformconfigname;
    private String platformconfigplatformtype;
    private String experimentname;
    
    private Map<String, Double> metrics;

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
 
    public String getWorkloadConfigName() {
        return workloadconfigname;
    }
    public void setWorkloadConfigName(String workloadConfigName) {
        this.workloadconfigname = workloadConfigName;
    }
    
    public String getPlatformConfigName() {
        return platformconfigname;
    }
    public void setPlatformConfigName(String platformConfigName) {
        this.platformconfigname = platformConfigName;
    }
    
    public String getPlatformConfigPlatformType() {
        return platformconfigplatformtype;
    }
    public void setPlatformConfigPlatformType(String platformConfigPlatformType) {
        this.platformconfigplatformtype = platformConfigPlatformType;
    }
    
    public String getExperimentName() {
        return experimentname;
    }
    public void setExperimentName(String experimentName) {
        this.experimentname = experimentName;
    }

     
    public Map<String, Double> getMetrics() {
        return metrics;
    }

    public void setMetrics(Map<String, Double> metrics) {
        this.metrics = metrics;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getStackName() {
        return stackName;
    }

    public void setStackName(String stackName) {
        this.stackName = stackName;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }
}
