package com.gov.tax.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gov.tax.dto.TaxFillingDTO;
import com.gov.tax.entity.Deduction;
import com.gov.tax.entity.Income;
import com.gov.tax.entity.TaxCalculation;
import com.gov.tax.entity.TaxFilling;
import com.gov.tax.entity.User;
import com.gov.tax.exception.ResourceAlreadyExistsException;
import com.gov.tax.exception.ResourceNotFoundException;
import com.gov.tax.repository.TaxCalculationRepository;
import com.gov.tax.repository.TaxFillingRepository;
import com.gov.tax.repository.TaxPaymentRepository;
import com.gov.tax.repository.UserRepository;
import com.gov.tax.service.DeductionService;
import com.gov.tax.service.IncomeService;
import com.itextpdf.text.DocumentException;

@ExtendWith(MockitoExtension.class)
class TaxFillingServiceImplTest {

	@Mock
	private TaxFillingRepository taxFillingRepository;

	@Mock
	private TaxCalculationRepository taxCalculationRepository;
	@Mock
	private TaxPaymentRepository taxPaymentRepository;
	@Mock
	private UserRepository userRepository;
	@Mock
	private IncomeService incomeService;
	@Mock
	private DeductionService deductionService;

	@InjectMocks
	private TaxFillingServiceImpl taxFillingServiceImpl;

	private TaxFillingDTO taxFillingDTO;
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
	void checkIfTaxCalculationExists_Success() {
		when(taxCalculationRepository.findByUserUserIdAndTaxYear(USER_ID, TAX_YEAR))
				.thenReturn(Optional.of(new TaxCalculation()));
		assertTrue(taxFillingServiceImpl.checkIfTaxCalculationExists(USER_ID, TAX_YEAR));
	}

	@Test
	void checkIfTaxCalculationExists_Failure() {
		when(taxCalculationRepository.findByUserUserIdAndTaxYear(USER_ID, TAX_YEAR)).thenReturn(Optional.empty());
		assertFalse(taxFillingServiceImpl.checkIfTaxCalculationExists(USER_ID, TAX_YEAR));
	}

	@Test
	void isPdfGenerated_Success() {
		when(taxFillingRepository.isPdfGeneratedForUserAndYear(USER_ID, TAX_YEAR)).thenReturn(true);
		assertTrue(taxFillingServiceImpl.isPdfGenerated(USER_ID, TAX_YEAR));
	}

	@Test
	void isPdfGenerated_Failure() {
		when(taxFillingRepository.isPdfGeneratedForUserAndYear(USER_ID, TAX_YEAR)).thenReturn(false);
		assertFalse(taxFillingServiceImpl.isPdfGenerated(USER_ID, TAX_YEAR));
	}

	@Test
	void submitTaxReturn_Success() {
		when(taxFillingRepository.isPdfGeneratedForUserAndYear(USER_ID, TAX_YEAR)).thenReturn(true);
		taxFilling.setFillingStatus("Pending");
		when(taxFillingRepository.findByUserUserIdAndTaxYear(USER_ID, TAX_YEAR)).thenReturn(Optional.of(taxFilling));

		taxCalculation.setTaxLiability(BigDecimal.ZERO);
		when(taxCalculationRepository.findByUserUserIdAndTaxYear(USER_ID, TAX_YEAR))
				.thenReturn(Optional.of(taxCalculation));

		String result = taxFillingServiceImpl.submitTaxReturn(USER_ID, TAX_YEAR);
		assertEquals("Tax return successfully filed.", result);
	}

	@Test
	void submitTaxReturn_PdfNotGenerated_Exception() {
		when(taxFillingRepository.isPdfGeneratedForUserAndYear(USER_ID, TAX_YEAR)).thenReturn(false);
		assertThrows(ResourceNotFoundException.class, () -> taxFillingServiceImpl.submitTaxReturn(USER_ID, TAX_YEAR));
	}

	@Test
	void submitTaxReturn_AlreadyFiled() {
		when(taxFillingRepository.isPdfGeneratedForUserAndYear(USER_ID, TAX_YEAR)).thenReturn(true);
		taxFilling.setFillingStatus("Filled");
		when(taxFillingRepository.findByUserUserIdAndTaxYear(USER_ID, TAX_YEAR)).thenReturn(Optional.of(taxFilling));

		String result = taxFillingServiceImpl.submitTaxReturn(USER_ID, TAX_YEAR);
		assertEquals("Tax return already Filed", result);
	}

	@Test
	void getFillingStatus_Success() {
		taxFilling.setFillingStatus("Filled");
		when(taxFillingRepository.findByUserUserIdAndTaxYear(USER_ID, TAX_YEAR)).thenReturn(Optional.of(taxFilling));

		String status = taxFillingServiceImpl.getFillingStatus(USER_ID, TAX_YEAR);
		assertEquals("Filled", status);
	}

	@Test
	void getFillingStatus_NotFound_Exception() {
		when(taxFillingRepository.findByUserUserIdAndTaxYear(USER_ID, TAX_YEAR)).thenReturn(Optional.empty());
		assertThrows(ResourceNotFoundException.class, () -> taxFillingServiceImpl.getFillingStatus(USER_ID, TAX_YEAR));
	}

	@Test
	void getTaxFillingHistory_Success() {
		when(taxFillingRepository.findAllByUserUserId(USER_ID)).thenReturn(List.of(new TaxFilling()));
		assertFalse(taxFillingServiceImpl.getTaxFillingHistory(USER_ID).isEmpty());
	}

	@Test
	void getTaxFillingHistory_EmptyHistory_Exception() {
		when(taxFillingRepository.findAllByUserUserId(USER_ID)).thenReturn(List.of());
		assertThrows(ResourceNotFoundException.class, () -> taxFillingServiceImpl.getTaxFillingHistory(USER_ID));
	}

	@Test
	void generateTaxFillingPdf_Success() throws IOException, DocumentException {
		when(taxCalculationRepository.findByUserUserIdAndTaxYear(USER_ID, TAX_YEAR))
				.thenReturn(Optional.of(new TaxCalculation()));
		when(taxFillingRepository.isPdfGeneratedForUserAndYear(USER_ID, TAX_YEAR)).thenReturn(false);
		when(incomeService.getIncomesByYearAndUserId(USER_ID, Year.now().getValue(), 0)).thenReturn(List.of());
		when(deductionService.getDeductionsByYearAndUserId(USER_ID, Year.now().getValue(), 0)).thenReturn(List.of());
		when(userRepository.findById(USER_ID)).thenReturn(Optional.of(new User()));
		taxFillingDTO.setUserId(USER_ID);
		byte[] pdf = taxFillingServiceImpl.generateTaxFillingPdf(taxFillingDTO);
		assertNotNull(pdf, "PDF should be generated successfully.");
	}

	@Test
	void generateTaxFillingPdf_TaxCalculationNotFound_Exception() {
		when(taxCalculationRepository.findByUserUserIdAndTaxYear(USER_ID, TAX_YEAR)).thenReturn(Optional.empty());
		assertThrows(ResourceNotFoundException.class, () -> taxFillingServiceImpl.generateTaxFillingPdf(taxFillingDTO));
	}

	@Test
	void generateTaxFillingPdf_AlreadyExists_Exception() {
		when(taxCalculationRepository.findByUserUserIdAndTaxYear(USER_ID, TAX_YEAR))
				.thenReturn(Optional.of(new TaxCalculation()));
		when(taxFillingRepository.isPdfGeneratedForUserAndYear(USER_ID, TAX_YEAR)).thenReturn(true);

		assertThrows(ResourceAlreadyExistsException.class,
				() -> taxFillingServiceImpl.generateTaxFillingPdf(taxFillingDTO));
	}

	@Test
	void createTaxFillingPdf_Success() throws IOException, DocumentException {
		// Mocking income with non-null amount
		Income income = new Income();
		income.setAmount(BigDecimal.valueOf(50000)); // Set a valid amount

		// Mocking deduction with valid data
		Deduction deduction = new Deduction();
		deduction.setAmount(BigDecimal.valueOf(10000)); // Set a valid deduction

		// Mocking income and deduction service calls
		when(incomeService.getIncomesByYearAndUserId(USER_ID, Year.now().getValue(), 0)).thenReturn(List.of(income));

		when(deductionService.getDeductionsByYearAndUserId(USER_ID, Year.now().getValue(), 0))
				.thenReturn(List.of(deduction));

		// Call the method and validate that a PDF is returned
		byte[] pdf = taxFillingServiceImpl.createTaxFillingPdf(taxFillingDTO);
		assertNotNull(pdf, "The generated PDF should not be null.");
	}

	@Test
	void createTaxFillingPdf_EmptyIncomesAndDeductions() throws IOException, DocumentException {
		// Mock empty lists for incomes and deductions
		when(incomeService.getIncomesByYearAndUserId(USER_ID, Year.now().getValue(), 0)).thenReturn(List.of());
		when(deductionService.getDeductionsByYearAndUserId(USER_ID, Year.now().getValue(), 0)).thenReturn(List.of());

		// Generate PDF and check if it still works
		byte[] pdf = taxFillingServiceImpl.createTaxFillingPdf(taxFillingDTO);
		assertNotNull(pdf, "PDF should be generated even if there are no incomes or deductions.");
	}

	@Test
	void createTaxFillingPdf_RuntimeException_Thrown() {
		// Mock a scenario where fetching incomes throws a RuntimeException
		when(incomeService.getIncomesByYearAndUserId(USER_ID, Year.now().getValue(), 0))
				.thenThrow(new RuntimeException("Failed to fetch incomes"));

		// Assert that RuntimeException is thrown during PDF generation
		assertThrows(RuntimeException.class, () -> taxFillingServiceImpl.createTaxFillingPdf(taxFillingDTO));
	}

	@Test
	void createTaxFillingPdf_DocumentException_Thrown() {
		// Simulate deduction service throwing a DocumentException
		when(incomeService.getIncomesByYearAndUserId(USER_ID, Year.now().getValue(), 0))
				.thenReturn(List.of(new Income()));
		when(deductionService.getDeductionsByYearAndUserId(USER_ID, Year.now().getValue(), 0))
				.thenThrow(new RuntimeException("Failed to fetch deductions"));

		// Assert DocumentException is thrown
		assertThrows(RuntimeException.class, () -> taxFillingServiceImpl.createTaxFillingPdf(taxFillingDTO));
	}

}
