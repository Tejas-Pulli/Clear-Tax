package com.gov.tax.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

import java.io.IOException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.gov.tax.dto.RefundStatusUpdateRequest;
import com.gov.tax.entity.TaxRefund;
import com.gov.tax.service.TaxRefundService;

class TaxRefundControllerTest {

	@Mock
	private TaxRefundService taxRefundService;

	@InjectMocks
	private TaxRefundController taxRefundController;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	// Success: Get Tax Refund
	@Test
	void testGetTaxRefund_Success() {
		TaxRefund mockRefund = new TaxRefund();
		when(taxRefundService.getTaxRefund(anyLong())).thenReturn(mockRefund);

		ResponseEntity<TaxRefund> response = taxRefundController.getTaxRefund(1L);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(mockRefund, response.getBody());
	}

	// Failure: Get Tax Refund (Exception)
	@Test
	void testGetTaxRefund_Failure() {
		when(taxRefundService.getTaxRefund(anyLong())).thenThrow(new RuntimeException("User not found"));

		try {
			taxRefundController.getTaxRefund(1L);
		} catch (Exception e) {
			assertEquals("User not found", e.getMessage());
		}
	}

	// Success: Update Refund Status
	@Test
	void testUpdateRefundStatus_Success() {
		RefundStatusUpdateRequest request = new RefundStatusUpdateRequest();
		TaxRefund updatedRefund = new TaxRefund();

		when(taxRefundService.updateRefundStatus(anyLong(), any())).thenReturn(updatedRefund);

		ResponseEntity<TaxRefund> response = taxRefundController.updateRefundStatus(1L, request);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(updatedRefund, response.getBody());
	}

	// Failure: Update Refund Status (Exception)
	@Test
	void testUpdateRefundStatus_Failure() {
		RefundStatusUpdateRequest request = new RefundStatusUpdateRequest();
		when(taxRefundService.updateRefundStatus(anyLong(), any()))
				.thenThrow(new RuntimeException("Failed to update status"));

		try {
			taxRefundController.updateRefundStatus(1L, request);
		} catch (Exception e) {
			assertEquals("Failed to update status", e.getMessage());
		}
	}

	// Success: Fetch Refund Certificate
	@Test
	void testFetchRefundCertificate_Success() throws Exception {
		byte[] pdfContent = new byte[] { 1, 2, 3 };
		when(taxRefundService.fetchRefundCertificate(anyLong())).thenReturn(pdfContent);

		ResponseEntity<byte[]> response = taxRefundController.fetchRefundCertificate(1L);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(pdfContent, response.getBody());
	}

	// Failure: Fetch Refund Certificate (Exception)
	@Test
	void testFetchRefundCertificate_Failure() throws Exception {
		when(taxRefundService.fetchRefundCertificate(anyLong())).thenThrow(new IOException("Failed to generate PDF"));

		try {
			taxRefundController.fetchRefundCertificate(1L);
		} catch (Exception e) {
			assertEquals("Failed to generate PDF", e.getMessage());
		}
	}
}
