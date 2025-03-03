package com.gov.tax.controller;

import java.time.Year;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gov.tax.dto.TaxFillingDTO;
import com.gov.tax.entity.TaxFilling;
import com.gov.tax.service.TaxFillingService;

import lombok.RequiredArgsConstructor;

/**
 * Controller for handling tax filing operations, including PDF generation,
 * submission, and status fetching.
 */
@RestController
@RequestMapping("/api/tax-filling")
@RequiredArgsConstructor
public class TaxFillingController {

	private final TaxFillingService taxFillingService;

	/**
	 * Generates a tax filing PDF based on the submitted details.
	 *
	 * @param taxFillingDTO The tax filing details.
	 * @return ResponseEntity containing the generated PDF.
	 */
	@PostMapping("/generate-pdf")
	public ResponseEntity<byte[]> generateTaxFilingPdf(@RequestBody TaxFillingDTO taxFillingDTO) {
		try {
			return ResponseEntity.ok().header("Content-Type", "application/pdf")
					.header("Content-Disposition", "attachment; filename=tax_filing.pdf")
					.body(taxFillingService.generateTaxFillingPdf(taxFillingDTO));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}

	/**
	 * Creates a tax filing PDF and returns it.
	 *
	 * @param taxFillingDTO The tax filing details.
	 * @return ResponseEntity containing the generated PDF.
	 */
	@PostMapping("/create-pdf")
	public ResponseEntity<byte[]> createTaxFilingPdf(@RequestBody TaxFillingDTO taxFillingDTO) {
		try {
			return ResponseEntity.ok().header("Content-Type", "application/pdf")
					.header("Content-Disposition", "attachment; filename=tax_filing.pdf")
					.body(taxFillingService.createTaxFillingPdf(taxFillingDTO));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}

	/**
	 * Submits the tax return for a given user and tax year.
	 *
	 * @param userId  The user ID.
	 * @param taxYear The tax year.
	 * @return ResponseEntity containing a confirmation message.
	 */
	@PostMapping("/submit")
	public ResponseEntity<String> submitTaxReturn(@RequestParam Long userId, @RequestParam Year taxYear) {
		return ResponseEntity.ok(taxFillingService.submitTaxReturn(userId, taxYear));
	}

	/**
	 * Retrieves the filing status for a given user and tax year.
	 *
	 * @param userId  The user ID.
	 * @param taxYear The tax year.
	 * @return ResponseEntity containing the tax filing status.
	 */
	@GetMapping("/filling-status")
	public ResponseEntity<String> getFillingStatus(@RequestParam Long userId, @RequestParam Year taxYear) {
		return ResponseEntity.ok(taxFillingService.getFillingStatus(userId, taxYear));
	}

	/**
	 * Checks if the tax filing PDF has been generated for a user in a specific
	 * year.
	 *
	 * @param userId  The user ID.
	 * @param taxYear The tax year.
	 * @return ResponseEntity containing a boolean indicating whether the PDF is
	 *         generated.
	 */
	@GetMapping("/isPdfGenerated")
	public ResponseEntity<Boolean> isPdfGenerated(@RequestParam Long userId, @RequestParam Year taxYear) {
		return ResponseEntity.ok(taxFillingService.isPdfGenerated(userId, taxYear));
	}

	/**
	 * Retrieves the tax filing history for a given user.
	 *
	 * @param userId The user ID.
	 * @return ResponseEntity containing the list of past tax filings.
	 */
	@GetMapping("/getTaxFillingHistory")
	public ResponseEntity<List<TaxFilling>> getTaxFillingHistory(@RequestParam Long userId) {
		return ResponseEntity.ok(taxFillingService.getTaxFillingHistory(userId));
	}
}
