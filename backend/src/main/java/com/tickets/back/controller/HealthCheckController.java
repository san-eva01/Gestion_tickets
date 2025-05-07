package com.tickets.back.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthCheckController {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private Environment env;

    @GetMapping("/api/health")
    public Map<String, Object> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("timestamp", System.currentTimeMillis());

        // Check database connection
        try (Connection conn = dataSource.getConnection()) {
            status.put("database", "Connected");
            status.put("database_url", conn.getMetaData().getURL());
            status.put("database_user", conn.getMetaData().getUserName());
        } catch (Exception e) {
            status.put("database", "Error");
            status.put("database_error", e.getMessage());
        }

        // System info
        status.put("java_version", System.getProperty("java.version"));
        status.put("port", env.getProperty("server.port"));
        status.put("running_port", env.getProperty("local.server.port"));

        // Memory info
        Runtime runtime = Runtime.getRuntime();
        status.put("memory_total", runtime.totalMemory());
        status.put("memory_free", runtime.freeMemory());
        status.put("memory_max", runtime.maxMemory());

        return status;
    }

    // Add a root endpoint for basic connectivity testing
    @GetMapping("/")
    public String root() {
        return "forward:/index.html";        //return "Tickets API is running. Access /health for more details.";
    }
}