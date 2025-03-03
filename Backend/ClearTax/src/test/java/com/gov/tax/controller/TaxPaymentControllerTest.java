package com.gov.tax.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import com.gov.tax.entity.TaxPayment;
import com.gov.tax.service.TaxPaymentService;
import com.itextpdf.text.DocumentException;
import com.razorpay.RazorpayException;

class TaxPaymentControllerTest {

	@Mock
	private TaxPaymentService taxPaymentService;

	@InjectMocks
	private TaxPaymentController taxPaymentController;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testGetTaxPaymentByUserId() {
		TaxPayment mockPayment = new TaxPayment();
		when(taxPaymentService.getTaxPaymentByUserId(anyLong())).thenReturn(mockPayment);

		ResponseEntity<TaxPayment> response = taxPaymentController.getTaxPaymentByUserId(1L);

		assertEquals(200, response.getStatusCode().value());
		assertEquals(mockPayment, response.getBody());
	}

	@Test
	void testGetAllTaxPaymentByUserId() {
		List<TaxPayment> payments = Arrays.asList(new TaxPayment(), new TaxPayment());
		when(taxPaymentService.getAllTaxPaymentByUserId(anyLong())).thenReturn(payments);

		ResponseEntity<List<TaxPayment>> response = taxPaymentController.getAllTaxPaymentByUserId(1L);

		assertEquals(200, response.getStatusCode().value());
		assertEquals(payments, response.getBody());
	}

	@Test
	void testGetTaxPaymentByUserIdAndTransactionId() {
		TaxPayment mockPayment = new TaxPayment();
		when(taxPaymentService.getTaxPaymentByUserIdAndTransactionId(anyLong(), anyString())).thenReturn(mockPayment);

		ResponseEntity<TaxPayment> response = taxPaymentController.getTaxPaymentByUserIdAndTransactionId(1L, "txn123");

		assertEquals(200, response.getStatusCode().value());
		assertEquals(mockPayment, response.getBody());
	}

	@Test
	void testPayTaxAtRazorpay() throws RazorpayException {
		TaxPayment mockPayment = new TaxPayment();
		when(taxPaymentService.payTaxAtRazorpay(anyLong(), anyInt())).thenReturn(mockPayment);

		ResponseEntity<TaxPayment> response = taxPaymentController.payTaxAtRazorpay(1L, 0);

		assertEquals(200, response.getStatusCode().value());
		assertEquals(mockPayment, response.getBody());
	}

	@Test
	void testVerifyPayment() throws RazorpayException {
		String successMessage = "Payment Verified Successfully";
		when(taxPaymentService.verifyPayment(anyString(), anyString(), anyString())).thenReturn(successMessage);

		ResponseEntity<String> response = taxPaymentController.verifyPayment("order123", "payment123", "signature123");

		assertEquals(200, response.getStatusCode().value());
		assertEquals(successMessage, response.getBody());
	}

	@Test
	void testDownloadReceipt() throws DocumentException, IOException {
		byte[] pdfContent = new byte[] { 1, 2, 3 };
		when(taxPaymentService.downloadReceipt(anyLong(), anyString())).thenReturn(pdfContent);

		ResponseEntity<byte[]> response = taxPaymentController.downloadReceipt(1L, "txn123");

		assertEquals(200, response.getStatusCode().value());
		assertEquals(pdfContent, response.getBody());
	}

	@Test
	void testCreateTaxSummaryReport() throws IOException, DocumentException {
		byte[] pdfContent = new byte[] { 1, 2, 3 };
		when(taxPaymentService.createTaxSummaryReport(anyLong())).thenReturn(pdfContent);

		ResponseEntity<byte[]> response = taxPaymentController.createTaxSummaryReport(1L);

		assertEquals(200, response.getStatusCode().value());
		assertEquals(pdfContent, response.getBody());
	}

	@Test
	void testGenerateTaxTranscript() throws IOException, DocumentException {
		byte[] pdfContent = new byte[] { 1, 2, 3 };
		when(taxPaymentService.generateTaxTranscript(anyLong())).thenReturn(pdfContent);

		ResponseEntity<byte[]> response = taxPaymentController.generateTaxTranscript(1L);

		assertEquals(200, response.getStatusCode().value());
		assertEquals(pdfContent, response.getBody());
	}

	@Test
	void testDownloadReceipt_Exception() throws DocumentException, IOException {
		// Simulate an exception thrown by the service
		doThrow(new IOException("PDF generation failed")).when(taxPaymentService).downloadReceipt(anyLong(),
				anyString());

		ResponseEntity<byte[]> response = taxPaymentController.downloadReceipt(1L, "txn123");

		assertEquals(BAD_REQUEST.value(), response.getStatusCode().value());
		assertEquals(null, response.getBody());
	}

	@Test
	void testCreateTaxSummaryReport_Exception() throws IOException, DocumentException {
		// Simulate an exception thrown by the service
		doThrow(new DocumentException("Failed to create summary report")).when(taxPaymentService)
				.createTaxSummaryReport(anyLong());

		ResponseEntity<byte[]> response = taxPaymentController.createTaxSummaryReport(1L);

		assertEquals(BAD_REQUEST.value(), response.getStatusCode().value());
		assertEquals(null, response.getBody());
	}

	@Test
	void testGenerateTaxTranscript_Exception() throws IOException, DocumentException {
		// Simulate an exception thrown by the service
		doThrow(new IOException("Failed to generate transcript")).when(taxPaymentService)
				.generateTaxTranscript(anyLong());

		ResponseEntity<byte[]> response = taxPaymentController.generateTaxTranscript(1L);

		assertEquals(BAD_REQUEST.value(), response.getStatusCode().value());
		assertEquals(null, response.getBody());
	}

}
