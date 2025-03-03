package com.gov.tax.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gov.tax.dto.AmendmentRequestDTO;
import com.gov.tax.dto.UserDTO;
import com.gov.tax.entity.Deduction;
import com.gov.tax.entity.Income;
import com.gov.tax.entity.TaxCalculation;
import com.gov.tax.entity.User;
import com.gov.tax.exception.ResourceNotFoundException;
import com.gov.tax.mapper.UserMapper;
import com.gov.tax.repository.DeductionRepository;
import com.gov.tax.repository.IncomeRepository;
import com.gov.tax.repository.TaxCalculationRepository;
import com.gov.tax.service.TaxPaymentService;
import com.gov.tax.service.TaxRefundService;
import com.gov.tax.service.UserService;

@ExtendWith(MockitoExtension.class)
class TaxCalculationServiceImplTest {

	@Mock
	private IncomeRepository incomeRepository;
	@Mock
	private DeductionRepository deductionRepository;
	@Mock
	private TaxCalculationRepository taxCalculationRepository;
	@Mock
	private UserService userService;
	@Mock
	private UserMapper userMapper;
	@Mock
	private TaxPaymentService taxPaymentService;
	@Mock
	private TaxRefundService taxRefundService;

	@InjectMocks
	private TaxCalculationServiceImpl taxCalculationService;

	private static final Long USER_ID = 1L;
	private static final int YEAR = 2025;

	private Income testIncome;
	private Deduction testDeduction;
	private TaxCalculation testTaxCalculation;
	private AmendmentRequestDTO amendmentRequestDTO;
	private User user;
	private UserDTO userDTO;

	@BeforeEach
	void setUp() {
		testIncome = new Income();
		testIncome.setAmount(new BigDecimal("500000"));
		testIncome.setIncomeDate(LocalDate.of(YEAR, 1, 1));

		testDeduction = new Deduction();
		testDeduction.setAmount(new BigDecimal("50000"));
		testDeduction.setDeductionDate(LocalDate.of(YEAR, 1, 1));

		testTaxCalculation = new TaxCalculation();
		testTaxCalculation.setGrossIncome(new BigDecimal("500000"));
		testTaxCalculation.setDeductions(new BigDecimal("50000"));
		testTaxCalculation.setTaxableIncome(new BigDecimal("450000"));
		testTaxCalculation.setTaxLiability(new BigDecimal("22500"));
		testTaxCalculation.setTaxYear(Year.of(YEAR));
		testTaxCalculation.setIsAmended(0);

		user = new User();
		user.setUserId(USER_ID);

		userDTO = new UserDTO();
		userDTO.setUserId(USER_ID);

		amendmentRequestDTO = AmendmentRequestDTO.builder().user(user).taxYear(YEAR)
				.totalIncome(new BigDecimal("600000")).totalDeductions(new BigDecimal("60000"))
				.taxableIncome(new BigDecimal("540000")).isAmended(1).build();
	}

	@Test
	void testGetTaxDetails_Success() {
		when(taxCalculationRepository.findByUserUserIdAndTaxYearAndIsAmended(USER_ID, Year.of(YEAR), 0))
				.thenReturn(Optional.of(testTaxCalculation));

		// Mock income and deductions
		when(incomeRepository.findByUserUserIdAndIncomeDateYear(USER_ID, YEAR)).thenReturn(List.of(testIncome));
		when(deductionRepository.findByUserUserIdAndDeductionDateYear(USER_ID, YEAR))
				.thenReturn(List.of(testDeduction));

		TaxCalculation result = taxCalculationService.getTaxDetails(USER_ID, YEAR, 0);
		assertNotNull(result);
		assertEquals(new BigDecimal("22500"), result.getTaxLiability());
	}

	@Test
	void testGetTaxDetails_NotFound() {
		lenient().when(taxCalculationRepository.findByUserUserIdAndTaxYearAndIsAmended(USER_ID, Year.of(YEAR), 0))
				.thenReturn(Optional.empty());

		assertThrows(ResourceNotFoundException.class, () -> taxCalculationService.getTaxDetails(USER_ID, YEAR, 0));
	}

	@Test
	void testGetTaxHistory_Success() {
		when(taxCalculationRepository.findByUserUserId(USER_ID)).thenReturn(Optional.of(List.of(testTaxCalculation)));

		List<TaxCalculation> history = taxCalculationService.getTaxHistory(USER_ID);
		assertFalse(history.isEmpty());
	}

	@Test
	void testGetTaxHistory_NotFound() {
		when(taxCalculationRepository.findByUserUserId(USER_ID)).thenReturn(Optional.empty());

		assertThrows(ResourceNotFoundException.class, () -> taxCalculationService.getTaxHistory(USER_ID));
	}

	@Test
	void testCalculateAndUpdateTaxLiability_Success() {
		when(taxCalculationRepository.findByUserUserIdAndTaxYear(USER_ID, Year.of(YEAR)))
				.thenReturn(Optional.of(testTaxCalculation));

		when(incomeRepository.findByUserUserIdAndIncomeDateYear(USER_ID, YEAR)).thenReturn(List.of(testIncome));
		when(deductionRepository.findByUserUserIdAndDeductionDateYear(USER_ID, YEAR))
				.thenReturn(List.of(testDeduction));
		when(taxCalculationRepository.save(any(TaxCalculation.class))).thenReturn(testTaxCalculation);

		TaxCalculation updated = taxCalculationService.calculateAndUpdateTaxLiability(USER_ID, YEAR);
		assertNotNull(updated);
		assertEquals(new BigDecimal("2500.00"), updated.getTaxLiability());
	}

	@Test
	void testCalculateAndUpdateTaxLiability_NotFound() {
		when(taxCalculationRepository.findByUserUserIdAndTaxYear(USER_ID, Year.of(YEAR))).thenReturn(Optional.empty());

		assertThrows(ResourceNotFoundException.class,
				() -> taxCalculationService.calculateAndUpdateTaxLiability(USER_ID, YEAR));
	}

	@Test
	void testAmendTaxCalculation_Success_PaymentRequired() {
		when(taxCalculationRepository.findByUserUserIdAndTaxYearAndIsAmended(USER_ID, Year.of(YEAR), 0))
				.thenReturn(Optional.of(testTaxCalculation));

		when(incomeRepository.findByUserUserIdAndIncomeDateYear(USER_ID, YEAR)).thenReturn(List.of(testIncome));
		when(deductionRepository.findByUserUserIdAndDeductionDateYear(USER_ID, YEAR))
				.thenReturn(List.of(testDeduction));

		when(taxCalculationRepository.save(any(TaxCalculation.class))).thenReturn(testTaxCalculation);

		// Assume the original tax liability is 22500
		// Set a higher amended tax liability to trigger payment
		amendmentRequestDTO.setTaxableIncome(new BigDecimal("1700000"));
		amendmentRequestDTO.setTaxLiability(new BigDecimal("140000"));

		taxCalculationService.amendTaxCalculation(USER_ID, amendmentRequestDTO);

		// Verify that payment is created due to increased liability
		verify(taxPaymentService, times(1)).createPayment(USER_ID, new BigDecimal("117500.00"));
		verify(taxRefundService, times(0)).createRefund(anyLong(), any(BigDecimal.class));
	}

	@Test
	void testAmendTaxCalculation_Success_RefundRequired() {
		when(taxCalculationRepository.findByUserUserIdAndTaxYearAndIsAmended(USER_ID, Year.of(YEAR), 0))
				.thenReturn(Optional.of(testTaxCalculation));

		when(incomeRepository.findByUserUserIdAndIncomeDateYear(USER_ID, YEAR)).thenReturn(List.of(testIncome)); // Mocking
																													// income
																													// data
		when(deductionRepository.findByUserUserIdAndDeductionDateYear(USER_ID, YEAR))
				.thenReturn(List.of(testDeduction)); // Mocking deduction data

		when(taxCalculationRepository.save(any(TaxCalculation.class))).thenReturn(testTaxCalculation);

		// Set a lower amended tax liability to trigger refund
		amendmentRequestDTO.setTaxableIncome(new BigDecimal("400000"));
		amendmentRequestDTO.setTaxLiability(new BigDecimal("15000"));

		taxCalculationService.amendTaxCalculation(USER_ID, amendmentRequestDTO);

		// Verify that refund is created due to reduced liability
		verify(taxRefundService, times(1)).createRefund(USER_ID, new BigDecimal("22500.00"));
		verify(taxPaymentService, times(0)).createPayment(anyLong(), any(BigDecimal.class));
	}

	@Test
	void testAmendTaxCalculation_TaxNotFound() {
		lenient().when(taxCalculationRepository.findByUserUserIdAndTaxYearAndIsAmended(USER_ID, Year.of(YEAR), 0))
				.thenReturn(Optional.empty());

		assertThrows(ResourceNotFoundException.class,
				() -> taxCalculationService.amendTaxCalculation(USER_ID, amendmentRequestDTO));
	}

	@Test
	void testZeroIncome() {
		BigDecimal result = taxCalculationService.slabBasedTaxCalculation(BigDecimal.ZERO);
		assertEquals(BigDecimal.ZERO, result, "Tax should be zero for zero income");
	}

	@Test
	void testIncomeInSecondSlab() {
		BigDecimal result = taxCalculationService.slabBasedTaxCalculation(new BigDecimal("600000"));
		BigDecimal expectedTax = new BigDecimal("10000.00"); // (600000 - 400000) * 5%
		assertEquals(expectedTax, result, "Tax should be correctly calculated in the second slab");
	}

	@Test
	void testIncomeAtSecondSlab() {
		BigDecimal result = taxCalculationService.slabBasedTaxCalculation(new BigDecimal("800000"));
		BigDecimal expectedTax = new BigDecimal("20000.00"); // (400000 * 5%)
		assertEquals(expectedTax, result, "Tax should be correct for exactly 800000 income");
	}

	@Test
	void testIncomeInThirdSlab() {
		BigDecimal result = taxCalculationService.slabBasedTaxCalculation(new BigDecimal("1000000"));
		BigDecimal expectedTax = new BigDecimal("40000.00"); // (400000 * 5%) + (200000 * 10%)
		assertEquals(expectedTax, result, "Tax should be correct for income within third slab");
	}

	@Test
	void testIncomeAtFifthSlab() {
		BigDecimal result = taxCalculationService.slabBasedTaxCalculation(new BigDecimal("2000000"));
		BigDecimal expectedTax = new BigDecimal("200000.00"); // Sum of taxes from all previous slabs
		assertEquals(expectedTax, result, "Tax should be correct for income exactly at 2000000");
	}

	@Test
	void testNegativeIncome() {
		BigDecimal result = taxCalculationService.slabBasedTaxCalculation(new BigDecimal("-50000"));
		assertEquals(BigDecimal.ZERO, result, "Tax should be zero for negative income");
	}

	@Test
	void testCalculateGrossIncome_ResourceNotFoundException() {
		// Mock empty income list
		when(incomeRepository.findByUserUserIdAndIncomeDateYear(1L, 2023)).thenReturn(Collections.emptyList());

		// Assert exception is thrown
		ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
			taxCalculationService.calculateGrossIncome(1L, 2023);
		});

		assertEquals("Income Details are Missing", exception.getMessage());
	}

	@Test
	void testCalculateTotalDeductions_ResourceNotFoundException() {
		// Mock empty deduction list
		when(deductionRepository.findByUserUserIdAndDeductionDateYear(1L, 2023)).thenReturn(Collections.emptyList());

		// Assert exception is thrown
		ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
			taxCalculationService.calculateTotalDeductions(1L, 2023);
		});

		assertEquals("Deduction Details are Missing", exception.getMessage());
	}

	@Test
	void testTaxCalculationForAboveLastSlab() {
		// Income higher than the last slab threshold
		BigDecimal income = new BigDecimal("3000000"); // 3,000,000 income

		BigDecimal result = taxCalculationService.slabBasedTaxCalculation(income);

		BigDecimal expectedTax = new BigDecimal("480000.00");

		assertEquals(expectedTax, result, "Tax should be correctly calculated for income above last slab");
	}

}
