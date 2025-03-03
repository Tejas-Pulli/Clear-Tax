package com.gov.tax.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gov.tax.dto.AmendmentRequestDTO;
import com.gov.tax.entity.TaxCalculation;
import com.gov.tax.service.TaxCalculationService;

import lombok.RequiredArgsConstructor;

/**
 * Controller for handling tax calculations, including tax liability, gross
 * income, deductions, amendments, and tax history.
 */
@RestController
@RequestMapping("/api/tax-calculations")
@RequiredArgsConstructor
public class TaxCalculationController {

	private final TaxCalculationService taxCalculationService;

	/**
	 * Calculates and saves the tax liability for a user in a specific year.
	 *
	 * @param userId The user ID.
	 * @param year   The tax year.
	 * @return ResponseEntity containing the calculated tax details.
	 */
	@PostMapping("/{userId}/{year}")
	public ResponseEntity<TaxCalculation> calculateAndSaveTaxLiability(@PathVariable Long userId,
			@PathVariable int year) {
		return new ResponseEntity<>(taxCalculationService.calculateAndSaveTaxLiability(userId, year),
				HttpStatus.CREATED);
	}

	/**
	 * Updates the tax liability if income or deductions change for a given year.
	 *
	 * @param userId The user ID.
	 * @param year   The tax year.
	 * @return ResponseEntity containing the updated tax calculation details.
	 */
	@PutMapping("/{userId}/{year}")
	public ResponseEntity<TaxCalculation> calculateAndUpdateTaxLiability(@PathVariable Long userId,
			@PathVariable int year) {
		return ResponseEntity.ok(taxCalculationService.calculateAndUpdateTaxLiability(userId, year));
	}

	/**
	 * Retrieves tax details for a user for a specific year.
	 *
	 * @param userId    The user ID.
	 * @param year      The tax year.
	 * @param isAmended The amendment status (0 for new, 1 for amended).
	 * @return ResponseEntity containing the tax calculation details.
	 */
	@GetMapping("/{userId}/{year}")
	public ResponseEntity<TaxCalculation> getTaxDetails(@PathVariable Long userId, @PathVariable int year,
			@RequestParam int isAmended) {
		return ResponseEntity.ok(taxCalculationService.getTaxDetails(userId, year, isAmended));
	}

	/**
	 * Retrieves the tax history for a user.
	 *
	 * @param userId The user ID.
	 * @return ResponseEntity containing a list of past tax calculations.
	 */
	@GetMapping("/history/{userId}")
	public ResponseEntity<List<TaxCalculation>> getTaxHistory(@PathVariable Long userId) {
		return ResponseEntity.ok(taxCalculationService.getTaxHistory(userId));
	}

	/**
	 * Calculates the total gross income for a user in a given year.
	 *
	 * @param userId The user ID.
	 * @param year   The tax year.
	 * @return ResponseEntity containing the total gross income.
	 */
	@GetMapping("/gross-income/{userId}/{year}")
	public ResponseEntity<BigDecimal> calculateGrossIncome(@PathVariable Long userId, @PathVariable int year) {
		return ResponseEntity.ok(taxCalculationService.calculateGrossIncome(userId, year));
	}

	/**
	 * Calculates the total deductions for a user in a given year.
	 *
	 * @param userId The user ID.
	 * @param year   The tax year.
	 * @return ResponseEntity containing the total deductions.
	 */
	@GetMapping("/total-deduction/{userId}/{year}")
	public ResponseEntity<BigDecimal> calculateTotalDeductions(@PathVariable Long userId, @PathVariable int year) {
		return ResponseEntity.ok(taxCalculationService.calculateTotalDeductions(userId, year));
	}

	/**
	 * Calculates tax liability based on taxable income using slab-based tax
	 * calculation.
	 *
	 * @param taxableIncome The taxable income.
	 * @return ResponseEntity containing the calculated tax liability.
	 */
	@GetMapping("/tax-liability")
	public ResponseEntity<BigDecimal> slabBasedTaxCalculation(@RequestParam BigDecimal taxableIncome) {
		return ResponseEntity.ok(taxCalculationService.slabBasedTaxCalculation(taxableIncome));
	}

	/**
	 * Handles tax amendments when changes are needed.
	 *
	 * @param userId            The user ID.
	 * @param newTaxCalculation The amendment request details.
	 * @return ResponseEntity containing the amended tax details.
	 */
	@PostMapping("/amend")
	public ResponseEntity<AmendmentRequestDTO> amendTaxCalculation(@RequestParam Long userId,
			@RequestBody AmendmentRequestDTO newTaxCalculation) {
		return ResponseEntity.ok(taxCalculationService.amendTaxCalculation(userId, newTaxCalculation));
	}
}
