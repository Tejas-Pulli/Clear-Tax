package com.gov.tax.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.gov.tax.dto.TaxFillingDTO;
import com.gov.tax.entity.TaxCalculation;
import com.gov.tax.entity.TaxFilling;
import com.gov.tax.entity.User;
import com.gov.tax.service.TaxFillingService;
import com.itextpdf.text.DocumentException;

@ExtendWith(MockitoExtension.class)
class TaxFillingControllerTest {

	@Mock
	private TaxFillingService taxFillingService;

	@InjectMocks
	private TaxFillingController taxFillingController;

	private TaxFillingDTO taxFillingDTO;
	@SuppressWarnings("unused")
	private TaxCalculation taxCalculation;
	private TaxFilling taxFilling;
	private User user;

	private static final Long USER_ID = 1L;
	private static final String TEST_NAME = "User Name";
	private static final String TEST_EMAIL = "dumy1@gmail.com";
	private static final String TEST_GOVT_ID = "DUMYW1234R";
	private static final Year TAX_YEAR = Year.now();
	private static final BigDecimal GROSS_INCOME = BigDecimal.valueOf(4330943.27);
	private static final BigDecimal TOTAL_DEDUCTIONS = BigDecimal.valueOf(397040.95);
	private static final BigDecimal TAXABLE_INCOME = BigDecimal.valueOf(3933902.32);
	private static final BigDecimal TAX_LIABILITY = BigDecimal.valueOf(760170.70);
	private static final String PENDING_FILLING_STATUS = "Pending";
	private static final String REFUND_STATUS = "Not Processed";
	private static final Boolean PDF_GENERATED = false;

	@BeforeEach
	void setUp() {
		user = User.builder().userId(1L).name(TEST_NAME).email(TEST_EMAIL).governmentId(TEST_GOVT_ID).userRole("USER")
				.build();

		taxCalculation = TaxCalculation.builder().taxCalculationId(1L).user(user).grossIncome(GROSS_INCOME)
				.deductions(TOTAL_DEDUCTIONS).taxableIncome(TAXABLE_INCOME).taxLiability(TAX_LIABILITY)
				.taxYear(TAX_YEAR).isAmended(0).originalTaxCalculation(null).build();

		taxFillingDTO = TaxFillingDTO.builder().userId(USER_ID).userName(TEST_NAME).governmentId(TEST_GOVT_ID)
				.taxYear(TAX_YEAR).grossIncome(GROSS_INCOME).totalDeductions(TOTAL_DEDUCTIONS)
				.taxableIncome(TAXABLE_INCOME).taxLiabillity(TAX_LIABILITY).fillingStatus(PENDING_FILLING_STATUS)
				.refundStatus(REFUND_STATUS).build();

		taxFilling = TaxFilling.builder().taxFilingId(USER_ID).user(user).filingDate(LocalDate.now())
				.fillingStatus(PENDING_FILLING_STATUS).taxYear(TAX_YEAR).pdfGenerated(PDF_GENERATED)
				.refundStatus(REFUND_STATUS).build();
	}

	@Test
	void testGenerateTaxFilingPdf() throws IOException, DocumentException {
		when(taxFillingService.generateTaxFillingPdf(taxFillingDTO)).thenReturn(new byte[] { 1, 2, 3 });
		ResponseEntity<byte[]> result = taxFillingController.generateTaxFilingPdf(taxFillingDTO);
		assertNotNull(result);
		assertEquals(200, result.getStatusCode().value());
		assertNotNull(result.getBody());
		assertEquals("application/pdf", result.getHeaders().getContentType().toString());
	}

	@Test
	void testGenerateTaxFilingPdf_Failuer() throws IOException, DocumentException {
		taxFillingDTO.setUserId(100L);
		when(taxFillingService.generateTaxFillingPdf(taxFillingDTO)).thenReturn(null);

		ResponseEntity<byte[]> result = taxFillingController.generateTaxFilingPdf(null);

		assertNotNull(result);
		assertEquals(400, result.getStatusCode().value());
		assertNull(result.getBody());
	}

	@Test
	void testCreateTaxFilingPdf() throws IOException, DocumentException {
		when(taxFillingService.createTaxFillingPdf(any(TaxFillingDTO.class))).thenReturn(new byte[] { 4, 5, 6 });

		ResponseEntity<byte[]> result = taxFillingController.createTaxFilingPdf(taxFillingDTO);

		assertNotNull(result);
		assertEquals(200, result.getStatusCode().value());
		assertNotNull(result.getBody());
		assertEquals("application/pdf", result.getHeaders().getContentType().toString());
	}

	@Test
	void testCreateTaxFilingPdf_Failuer() throws IOException, DocumentException {
		taxFillingDTO.setUserId(100L);
		when(taxFillingService.createTaxFillingPdf(taxFillingDTO)).thenReturn(null);

		ResponseEntity<byte[]> result = taxFillingController.createTaxFilingPdf(null);

		assertNotNull(result);
		assertEquals(400, result.getStatusCode().value());
		assertNull(result.getBody());
	}

	@Test
	void testSubmitTaxReturn() {
		when(taxFillingService.submitTaxReturn(1L, Year.of(2025))).thenReturn("Submitted Successfully");
		ResponseEntity<String> response = taxFillingController.submitTaxReturn(1L, Year.of(2025));
		assertNotNull(response);
		assertEquals(200, response.getStatusCode().value());
		assertEquals("Submitted Successfully", response.getBody());
	}

	@Test
	void testGetFillingStatus() {
		when(taxFillingService.getFillingStatus(1L, Year.of(2025))).thenReturn("Pending");

		ResponseEntity<String> status = taxFillingController.getFillingStatus(1L, Year.of(2025));

		assertNotNull(status);
		assertEquals(200, status.getStatusCode().value());
		assertEquals("Pending", status.getBody());
	}

	@Test
	void testIsPdfGenerated() {
		when(taxFillingService.isPdfGenerated(1L, Year.of(2025))).thenReturn(true);

		ResponseEntity<Boolean> response = taxFillingController.isPdfGenerated(1L, Year.of(2025));

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(true, response.getBody()); // Validate the returned boolean value
	}

	@Test
	void testGetTaxFillingHistory() {
		when(taxFillingService.getTaxFillingHistory(1L)).thenReturn(List.of(taxFilling));
		ResponseEntity<List<TaxFilling>> history = taxFillingController.getTaxFillingHistory(1L);
		assertNotNull(history);
	}
}
