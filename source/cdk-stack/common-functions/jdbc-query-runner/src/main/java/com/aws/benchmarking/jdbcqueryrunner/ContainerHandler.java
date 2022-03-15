package com.aws.benchmarking.jdbcqueryrunner;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ContainerHandler {
    private static final Gson GSON = new Gson();

    public static void main(String[] args) {

        String secretId = System.getenv("secretId");
        String sessionId = System.getenv("sessionId");
        String stackName = System.getenv("stackName");
        List<String> queries = GSON.fromJson(System.getenv("queries"), new TypeToken<List<String>>() {
        }.getType());

        Handler handler = new Handler();
        for (String query : queries) {
            Map<String, String> event = new HashMap<>();
            event.put("secretId", secretId);
            event.put("sessionId", sessionId);
            event.put("stackName", stackName);
            event.put("scriptPath", query);
            handler.handleRequest(event, null);
        }
    }
}
