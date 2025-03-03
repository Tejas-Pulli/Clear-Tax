package com.gov.tax.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gov.tax.dto.DeductionDTO;
import com.gov.tax.entity.Deduction;
import com.gov.tax.service.DeductionService;

import lombok.RequiredArgsConstructor;

/**
 * Controller for handling Deduction-related operations.
 */
@RestController
@RequestMapping("/api/deductions")
@RequiredArgsConstructor
public class DeductionController {

	private final DeductionService deductionService;

	/**
	 * Add multiple deductions in the DB at once.
	 *
	 * @param deductionDtoList List of deduction DTOs to be added.
	 * @return ResponseEntity containing the list of added deductions.
	 */
	@PostMapping("/bulk")
	public ResponseEntity<List<Deduction>> addMultipleDeductions(@RequestBody List<DeductionDTO> deductionDtoList) {
		return new ResponseEntity<>(deductionService.addMultipleDeductions(deductionDtoList), HttpStatus.CREATED);
	}

	/**
	 * Updates existing deduction by ID.
	 *
	 * @param deductionId  ID of the deduction to update.
	 * @param deductionDTO updated deduction details.
	 * @return ResponseEntity containing the updated deduction.
	 */
	@PutMapping("/{deductionId}")
	public ResponseEntity<Deduction> updateDeduction(@PathVariable Long deductionId,
			@RequestBody DeductionDTO deductionDto) {
		return ResponseEntity.ok(deductionService.updateDeduction(deductionId, deductionDto));
	}

	/**
	 * Delete deduction by ID.
	 *
	 * @param deductionId ID of the deduction to delete.
	 * @return ResponseEntity containing a success message.
	 */
	@DeleteMapping("/{deductionId}")
	public ResponseEntity<String> deleteDeduction(@PathVariable Long deductionId) {
		return ResponseEntity.ok(deductionService.deleteDeduction(deductionId));
	}

	/**
	 * Retrieves all the deductions for a specific user based on amendment status.
	 *
	 * @param userId    user ID.
	 * @param isAmended The amendment status (0 for new, 1 for amended).
	 * @return ResponseEntity containing the list of deductions.
	 */
	@GetMapping("/user/{userId}")
	public ResponseEntity<List<Deduction>> getDeductionsByUserId(@PathVariable Long userId,
			@RequestParam int isAmended) {
		return ResponseEntity.ok(deductionService.getDeductionsByUserId(userId, isAmended));
	}

	/**
	 * Retrieves deductions for a specific user and year based on amendment status.
	 *
	 * @param userId    user ID.
	 * @param year      tax year.
	 * @param isAmended The amendment status (0 for new, 1 for amended).
	 * @return ResponseEntity containing the list of deductions.
	 */
	@GetMapping("/user/{userId}/{year}")
	public ResponseEntity<List<Deduction>> getDeductionsByYearAndUserId(@PathVariable Long userId,
			@PathVariable int year, @RequestParam int isAmended) {
		return ResponseEntity.ok(deductionService.getDeductionsByYearAndUserId(userId, year, isAmended));
	}
}
