package com.gov.tax.controller;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.gov.tax.dto.AmendmentRequestDTO;
import com.gov.tax.entity.Deduction;
import com.gov.tax.entity.Income;
import com.gov.tax.entity.TaxCalculation;
import com.gov.tax.entity.User;
import com.gov.tax.service.TaxCalculationService;

@ExtendWith(MockitoExtension.class)
class TaxCalculationControllerTest {

    @Mock
    private TaxCalculationService taxCalculationService;

    @InjectMocks
    private TaxCalculationController taxCalculationController;

    private TaxCalculation taxCalculation;
    private AmendmentRequestDTO amendmentRequestDTO;
    private Income testIncome;
    private Deduction testDeduction;
    private static final int YEAR = 2025;
	private static final String TEST_NAME = "Updated User";
	private static final String TEST_EMAIL = "dumy1@gmail.com";
	private static final String TEST_GOVT_ID = "DUMYW1234R";
	private User user;

    @BeforeEach
    void setUp() {
    	testIncome = new Income();
        testIncome.setAmount(new BigDecimal("500000"));
        testIncome.setIncomeDate(LocalDate.of(YEAR, 01, 01));
        testIncome.setIncomeSource("Salary");

        testDeduction = new Deduction();
        testDeduction.setAmount(new BigDecimal("50000"));
        testDeduction.setDeductionDate(LocalDate.of(YEAR, 01, 01));
        testDeduction.setDeductionType("Home Loan Interest");
        
        taxCalculation = new TaxCalculation();
        
        user = User.builder().userId(1L).name(TEST_NAME).email(TEST_EMAIL).governmentId(TEST_GOVT_ID).userRole("USER").build();

        
        amendmentRequestDTO = AmendmentRequestDTO.builder()
                .user(user)
                .taxYear(YEAR)
                .incomes(List.of(testIncome))
                .deductions(List.of(testDeduction))
                .originalTaxCalculationId(1)
                .totalIncome(new BigDecimal("600000"))
                .totalDeductions(new BigDecimal("60000"))
                .taxableIncome(new BigDecimal("540000"))
                .taxableIncome(new BigDecimal("540000"))
                .isAmended(1)
                .build();
    }

    @Test
    void testCalculateAndSaveTaxLiability() {
        when(taxCalculationService.calculateAndSaveTaxLiability(1L, 2024)).thenReturn(taxCalculation);
        ResponseEntity<TaxCalculation> response = taxCalculationController.calculateAndSaveTaxLiability(1L, 2024);
        assertEquals(201, response.getStatusCode().value());
        assertEquals(taxCalculation, response.getBody());
    }

    @Test
    void testCalculateAndUpdateTaxLiability() {
        when(taxCalculationService.calculateAndUpdateTaxLiability(1L, 2024)).thenReturn(taxCalculation);
        ResponseEntity<TaxCalculation> response = taxCalculationController.calculateAndUpdateTaxLiability(1L, 2024);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(taxCalculation, response.getBody());
    }

    @Test
    void testGetTaxDetails() {
        when(taxCalculationService.getTaxDetails(1L, 2024, 0)).thenReturn(taxCalculation);
        ResponseEntity<TaxCalculation> response = taxCalculationController.getTaxDetails(1L, 2024, 0);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(taxCalculation, response.getBody());
    }

    @Test
    void testGetTaxHistory() {
        List<TaxCalculation> taxHistory = Arrays.asList(taxCalculation);
        when(taxCalculationService.getTaxHistory(1L)).thenReturn(taxHistory);
        ResponseEntity<List<TaxCalculation>> response = taxCalculationController.getTaxHistory(1L);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testCalculateGrossIncome() {
        BigDecimal grossIncome = new BigDecimal("100000");
        when(taxCalculationService.calculateGrossIncome(1L, 2024)).thenReturn(grossIncome);
        ResponseEntity<BigDecimal> response = taxCalculationController.calculateGrossIncome(1L, 2024);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(grossIncome, response.getBody());
    }

    @Test
    void testCalculateTotalDeductions() {
        BigDecimal deductions = new BigDecimal("20000");
        when(taxCalculationService.calculateTotalDeductions(1L, 2024)).thenReturn(deductions);
        ResponseEntity<BigDecimal> response = taxCalculationController.calculateTotalDeductions(1L, 2024);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(deductions, response.getBody());
    }

    @Test
    void testSlabBasedTaxCalculation() {
        BigDecimal taxableIncome = new BigDecimal("80000");
        BigDecimal taxLiability = new BigDecimal("10000");
        when(taxCalculationService.slabBasedTaxCalculation(taxableIncome)).thenReturn(taxLiability);
        ResponseEntity<BigDecimal> response = taxCalculationController.slabBasedTaxCalculation(taxableIncome);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(taxLiability, response.getBody());
    }

    @Test
    void testAmendTaxCalculation() {
        when(taxCalculationService.amendTaxCalculation(1L, amendmentRequestDTO)).thenReturn(amendmentRequestDTO);
        ResponseEntity<AmendmentRequestDTO> response = taxCalculationController.amendTaxCalculation(1L, amendmentRequestDTO);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(amendmentRequestDTO, response.getBody());
    }
}
