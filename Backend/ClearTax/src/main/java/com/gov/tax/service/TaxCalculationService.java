package com.gov.tax.service;

import java.math.BigDecimal;
import java.util.List;

import com.gov.tax.dto.AmendmentRequestDTO;
import com.gov.tax.entity.TaxCalculation;

public interface TaxCalculationService {
	boolean validateIncomeAndDeductions(Long userId, int year);

	TaxCalculation calculateAndSaveTaxLiability(Long userId, int year);

	BigDecimal calculateGrossIncome(Long userId, int year);

	BigDecimal calculateTotalDeductions(Long userId, int year);

	List<TaxCalculation> getTaxHistory(Long userId);

	TaxCalculation calculateAndUpdateTaxLiability(Long userId, int year);

	BigDecimal slabBasedTaxCalculation(BigDecimal taxableIncome);

	AmendmentRequestDTO amendTaxCalculation(Long userId, AmendmentRequestDTO newCalculationDetails);

	TaxCalculation getTaxDetails(Long userId, int year, int isAmended);
}
