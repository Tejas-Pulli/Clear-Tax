package com.gov.tax.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller to check the health status of the server.
 */
@RestController
@RequestMapping("/api/healthChecker")
public class HealthCheckController {

    /**
     * Endpoint to check if the server is running.
     *
     * @return ResponseEntity with a message indicating server status.
     */
    @GetMapping("/health-check")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Server is running");
    }
}
