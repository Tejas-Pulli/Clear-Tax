package com.gov.tax.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Year;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gov.tax.dto.AmendmentRequestDTO;
import com.gov.tax.dto.UserDTO;
import com.gov.tax.entity.Deduction;
import com.gov.tax.entity.Income;
import com.gov.tax.entity.TaxCalculation;
import com.gov.tax.exception.ResourceNotFoundException;
import com.gov.tax.mapper.UserMapper;
import com.gov.tax.repository.DeductionRepository;
import com.gov.tax.repository.IncomeRepository;
import com.gov.tax.repository.TaxCalculationRepository;
import com.gov.tax.service.TaxCalculationService;
import com.gov.tax.service.TaxPaymentService;
import com.gov.tax.service.TaxRefundService;
import com.gov.tax.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaxCalculationServiceImpl implements TaxCalculationService {

	private final IncomeRepository incomeRepository;
	private final DeductionRepository deductionRepository;
	private final TaxCalculationRepository taxCalculationRepository;
	private final UserService userService;
	private final UserMapper userMapper;
	private final TaxRefundService taxRefundService;

	private final TaxPaymentService taxPaymentService;

	/**
	 * Validates whether income and deductions exist for a given user and year.
	 * 
	 * @param userId The ID of the user.
	 * @param year   The tax year.
	 * @return true if income and deductions exist, false otherwise.
	 */
	@Override
	public boolean validateIncomeAndDeductions(Long userId, int year) {
		return !incomeRepository.findByUserUserIdAndIncomeDateYear(userId, year).isEmpty()
				&& !deductionRepository.findByUserUserIdAndDeductionDateYear(userId, year).isEmpty();
	}

	/**
	 * Calculates and saves the tax liability for a user based on income and
	 * deductions.
	 * 
	 * @param userId The ID of the user.
	 * @param year   The tax year.
	 * @return The calculated TaxCalculation entity.
	 */
	@Override
	public TaxCalculation calculateAndSaveTaxLiability(Long userId, int year) {
		if (!validateIncomeAndDeductions(userId, year)) {
			throw new ResourceNotFoundException("Income or Deduction Data Missing..!");
		}
		BigDecimal grossIncome = calculateGrossIncome(userId, year);
		BigDecimal totalDeductions = calculateTotalDeductions(userId, year);
		BigDecimal taxableIncome = grossIncome.subtract(totalDeductions);
		BigDecimal tax = slabBasedTaxCalculation(taxableIncome);

		UserDTO user = userService.getUserById(userId);

		TaxCalculation taxCalculation = TaxCalculation.builder().user(userMapper.toEntity(user))
				.grossIncome(grossIncome).deductions(totalDeductions).taxableIncome(taxableIncome)
				.taxLiability(tax.setScale(2, RoundingMode.HALF_UP)).taxYear(Year.of(year)).isAmended(0).build();

		return taxCalculationRepository.save(taxCalculation);
	}

	/**
	 * Calculates tax based on predefined tax slabs.
	 * 
	 * @param taxableIncome The taxable income amount.
	 * @return The calculated tax liability.
	 */
	@Override
	public BigDecimal slabBasedTaxCalculation(BigDecimal taxableIncome) {
		if (taxableIncome.compareTo(BigDecimal.ZERO) <= 0) {
			return BigDecimal.ZERO;
		}

		BigDecimal tax = BigDecimal.ZERO;
		BigDecimal[] slabs = { new BigDecimal("400000"), new BigDecimal("800000"), new BigDecimal("1200000"),
				new BigDecimal("1600000"), new BigDecimal("2000000"), new BigDecimal("2400000") };
		BigDecimal[] rates = { BigDecimal.ZERO, new BigDecimal("0.05"), new BigDecimal("0.10"), new BigDecimal("0.15"),
				new BigDecimal("0.20"), new BigDecimal("0.25"), new BigDecimal("0.30") };

		for (int i = 1; i < slabs.length; i++) {
			if (taxableIncome.compareTo(slabs[i]) > 0) {
				tax = tax.add(slabs[i].subtract(slabs[i - 1]).multiply(rates[i]));
			} else {
				tax = tax.add(taxableIncome.subtract(slabs[i - 1]).multiply(rates[i]));
				return tax.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : tax;
			}
		}
		tax = tax.add(taxableIncome.subtract(slabs[slabs.length - 1]).multiply(rates[rates.length - 1]));
		return tax.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : tax;
	}

	/**
	 * Calculates the total gross income of a user for a given year.
	 * 
	 * @param userId The ID of the user.
	 * @param year   The tax year.
	 * @return The total gross income.
	 */
	@Override
	public BigDecimal calculateGrossIncome(Long userId, int year) {
		List<Income> incomes = incomeRepository.findByUserUserIdAndIncomeDateYear(userId, year);
		if (incomes.isEmpty()) {
			throw new ResourceNotFoundException("Income Details are Missing");
		}
		return incomes.stream().map(Income::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	/**
	 * Calculates the total deductions for a user in a given year.
	 * 
	 * @param userId The ID of the user.
	 * @param year   The tax year.
	 * @return The total deductions.
	 */
	@Override
	public BigDecimal calculateTotalDeductions(Long userId, int year) {
		List<Deduction> deductions = deductionRepository.findByUserUserIdAndDeductionDateYear(userId, year);
		if (deductions.isEmpty()) {
			throw new ResourceNotFoundException("Deduction Details are Missing");
		}
		return deductions.stream().map(Deduction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	/**
	 * Retrieves tax details for a user for a given year.
	 * 
	 * @param userId    The ID of the user.
	 * @param year      The tax year.
	 * @param isAmended Amendment status.
	 * @return The TaxCalculation entity.
	 */
	@Override
	public TaxCalculation getTaxDetails(Long userId, int year, int isAmended) {
		if (!validateIncomeAndDeductions(userId, year)) {
			throw new ResourceNotFoundException("Income or deductions are missing for the year " + year);
		}

		return taxCalculationRepository.findByUserUserIdAndTaxYearAndIsAmended(userId, Year.of(year), isAmended)
				.orElseThrow(() -> new ResourceNotFoundException("Tax details not found for the selected year"));
	}

	/**
	 * Retrieves tax history for a given user.
	 * 
	 * @param userId The ID of the user.
	 * @return A list of TaxCalculation entities.
	 */
	@Override
	public List<TaxCalculation> getTaxHistory(Long userId) {
		return taxCalculationRepository.findByUserUserId(userId)
				.orElseThrow(() -> new ResourceNotFoundException("Tax details not found for the User"));
	}

	/**
	 * Update tax liability when values change
	 * 
	 * @param userId The ID of the user.
	 * @param year   The tax year.
	 * @return The new calculated TaxCalculation entity.
	 * 
	 */
	@Override
	public TaxCalculation calculateAndUpdateTaxLiability(Long userId, int year) {
		TaxCalculation taxCalculation = taxCalculationRepository.findByUserUserIdAndTaxYear(userId, Year.of(year))
				.orElseThrow(() -> new ResourceNotFoundException("Tax Calculation not found"));
		taxCalculation.setGrossIncome(calculateGrossIncome(userId, year));
		taxCalculation.setDeductions(calculateTotalDeductions(userId, year));
		BigDecimal newTaxableIncome = taxCalculation.getGrossIncome().subtract(taxCalculation.getDeductions());
		taxCalculation.setTaxableIncome(newTaxableIncome);
		taxCalculation.setTaxLiability(slabBasedTaxCalculation(newTaxableIncome));

		return taxCalculationRepository.save(taxCalculation);
	}

	/**
	 * Handles tax amendment requests, updating tax calculations accordingly.
	 * 
	 * @param userId                The ID of the user.
	 * @param newCalculationDetails The new tax calculation details.
	 * @return The updated AmendmentRequestDTO.
	 */
	@Transactional
	@Override
	public AmendmentRequestDTO amendTaxCalculation(Long userId, AmendmentRequestDTO newCalculationDetails) {
		// get original tax calculation
		TaxCalculation originalTaxCalculation = getTaxDetails(userId, newCalculationDetails.getTaxYear(), 0);

		// create new tax calculation with amended details
		TaxCalculation newTaxCalculation = TaxCalculation.builder().user(newCalculationDetails.getUser())
				.grossIncome(newCalculationDetails.getTotalIncome())
				.deductions(newCalculationDetails.getTotalDeductions())
				.taxableIncome(newCalculationDetails.getTaxableIncome())
				.taxLiability(slabBasedTaxCalculation(newCalculationDetails.getTaxableIncome()))
				.taxYear(Year.of(newCalculationDetails.getTaxYear())).isAmended(newCalculationDetails.getIsAmended())
				.originalTaxCalculation(originalTaxCalculation).build();

		taxCalculationRepository.save(newTaxCalculation);

		// compare tax liabilities
		BigDecimal originalTaxLiability = originalTaxCalculation.getTaxLiability();
		BigDecimal newTaxLiability = newTaxCalculation.getTaxLiability();

		// if new tax is higher, user needs to pay extra
		if (newTaxLiability.compareTo(originalTaxLiability) > 0) {
			taxPaymentService.createPayment(userId, newTaxLiability.subtract(originalTaxLiability));
		}
		// if new tax is lower, user gets a refund
		else if (newTaxLiability.compareTo(originalTaxLiability) < 0) {
			taxRefundService.createRefund(userId, originalTaxLiability.subtract(newTaxLiability));
		}
		newCalculationDetails.setTaxLiability(newTaxLiability);
		return newCalculationDetails;
	}
}
