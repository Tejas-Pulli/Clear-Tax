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

import com.gov.tax.dto.IncomeDTO;
import com.gov.tax.entity.Income;
import com.gov.tax.service.IncomeService;

import lombok.RequiredArgsConstructor;

/**
 * Controller for handling income-related operations.
 */
@RestController
@RequestMapping("/api/incomes")
@RequiredArgsConstructor
public class IncomeController {

	private final IncomeService incomeService;

	/**
	 * Add multiple income records in DB at once.
	 *
	 * @param incomeDtoList List of income DTOs to be added.
	 * @return ResponseEntity containing the list of added income records.
	 */
	@PostMapping("/bulk")
	public ResponseEntity<List<Income>> addMultipleIncomes(@RequestBody List<IncomeDTO> incomeDtoList) {
		return new ResponseEntity<>(incomeService.addMultipleIncomes(incomeDtoList), HttpStatus.CREATED);
	}

	/**
	 * Update multiple income records for a user.
	 *
	 * @param userId         The user ID whose income records are to be updated.
	 * @param updatedIncomes The list of updated income details.
	 * @return ResponseEntity containing a success message.
	 */
	@PutMapping("/user/{userId}/update")
	public ResponseEntity<String> updateIncomeDetails(@PathVariable Long userId,
			@RequestBody List<IncomeDTO> updatedIncomes) {
		return ResponseEntity.ok(incomeService.updateIncomeDetails(userId, updatedIncomes));
	}

	/**
	 * Updates a specific income record by its ID.
	 *
	 * @param incomeId The ID of the income record to update.
	 * @param income   The updated income details.
	 * @return ResponseEntity containing the updated income record.
	 */
	@PutMapping("/{incomeId}")
	public ResponseEntity<Income> updateIncome(@PathVariable Long incomeId, @RequestBody Income income) {
		return ResponseEntity.ok(incomeService.updateIncome(incomeId, income));
	}

	/**
	 * Deletes a specific income record by its ID.
	 *
	 * @param incomeId The ID of the income record to delete.
	 * @return ResponseEntity containing a success message.
	 */
	@DeleteMapping("/{incomeId}")
	public ResponseEntity<String> deleteIncome(@PathVariable Long incomeId) {
		return ResponseEntity.ok(incomeService.deleteIncome(incomeId));
	}

	/**
	 * Deletes all income records for a user for a specific year.
	 *
	 * @param userId The user ID.
	 * @param year   The tax year.
	 * @return ResponseEntity containing a success message.
	 */
	@DeleteMapping("/{userId}/year/{year}")
	public ResponseEntity<String> deleteIncomesByUserIdAndYear(@PathVariable Long userId, @PathVariable int year) {
		return ResponseEntity.ok(incomeService.deleteIncomesByUserIdAndYear(userId, year));
	}

	/**
	 * Retrieves all income records for a specific user based on amendment status.
	 *
	 * @param userId    user ID.
	 * @param isAmended amendment status (0 for new, 1 for amended).
	 * @return ResponseEntity containing the list of income records.
	 */
	@GetMapping("/user/{userId}")
	public ResponseEntity<List<Income>> getIncomesByUserId(@PathVariable Long userId, @RequestParam int isAmended) {
		return ResponseEntity.ok(incomeService.getIncomesByUserId(userId, isAmended));
	}

	/**
	 * Retrieves all income records for a user for a specific year based on
	 * amendment status.
	 *
	 * @param userId    user ID.
	 * @param year      tax year.
	 * @param isAmended amendment status (0 for new, 1 for amended).
	 * @return ResponseEntity containing the list of income records.
	 */
	@GetMapping("/user/{userId}/{year}")
	public ResponseEntity<List<Income>> getIncomesByYearAndUserId(@PathVariable Long userId, @PathVariable int year,
			@RequestParam int isAmended) {
		return ResponseEntity.ok(incomeService.getIncomesByYearAndUserId(userId, year, isAmended));
	}
}
