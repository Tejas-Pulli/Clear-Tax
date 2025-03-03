package com.gov.tax.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@WebMvcTest(HealthCheckController.class)
class HealthCheckControllerTest {

	private HealthCheckController healthCheckController;

	@BeforeEach
	void setUp() {
		healthCheckController = new HealthCheckController();
	}

	// Direct Method Test
	@Test
	void testHealthCheck_Success() {
		ResponseEntity<String> response = healthCheckController.healthCheck();

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("Server is running", response.getBody());
	}
}
