package com.gov.tax.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.gov.tax.dto.IncomeDTO;
import com.gov.tax.entity.Income;
import com.gov.tax.service.IncomeService;

class IncomeControllerTest {

	@Mock
	private IncomeService incomeService;

	@InjectMocks
	private IncomeController incomeController;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	// Test: Add Multiple Incomes Successfully
	@Test
	void testAddMultipleIncomes_Success() {
		List<IncomeDTO> incomeDtoList = Arrays.asList(new IncomeDTO(), new IncomeDTO());
		List<Income> incomeList = Arrays.asList(new Income(), new Income());

		when(incomeService.addMultipleIncomes(any())).thenReturn(incomeList);

		ResponseEntity<List<Income>> response = incomeController.addMultipleIncomes(incomeDtoList);

		assertEquals(HttpStatus.CREATED, response.getStatusCode());
		assertEquals(incomeList, response.getBody());
	}

	// Test: Update Multiple Incomes for a User
	@Test
	void testUpdateIncomeDetails_Success() {
		List<IncomeDTO> updatedIncomes = Arrays.asList(new IncomeDTO(), new IncomeDTO());
		when(incomeService.updateIncomeDetails(anyLong(), any())).thenReturn("Incomes updated successfully");

		ResponseEntity<String> response = incomeController.updateIncomeDetails(1L, updatedIncomes);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("Incomes updated successfully", response.getBody());
	}

	// Test: Update Specific Income by ID
	@Test
	void testUpdateIncome_Success() {
		Income income = new Income();
		when(incomeService.updateIncome(anyLong(), any())).thenReturn(income);

		ResponseEntity<Income> response = incomeController.updateIncome(1L, income);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(income, response.getBody());
	}

	// Test: Delete Specific Income Record by ID
	@Test
	void testDeleteIncome_Success() {
		when(incomeService.deleteIncome(anyLong())).thenReturn("Income record deleted successfully");

		ResponseEntity<String> response = incomeController.deleteIncome(1L);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("Income record deleted successfully", response.getBody());
	}

	// Test: Delete All Income Records for a User by Year
	@Test
	void testDeleteIncomesByUserIdAndYear_Success() {
		when(incomeService.deleteIncomesByUserIdAndYear(anyLong(), anyInt()))
				.thenReturn("All incomes deleted for the year");

		ResponseEntity<String> response = incomeController.deleteIncomesByUserIdAndYear(1L, 2024);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals("All incomes deleted for the year", response.getBody());
	}

	// Test: Retrieve Incomes by User ID and Amendment Status
	@Test
	void testGetIncomesByUserId_Success() {
		List<Income> incomes = Arrays.asList(new Income(), new Income());
		when(incomeService.getIncomesByUserId(anyLong(), anyInt())).thenReturn(incomes);

		ResponseEntity<List<Income>> response = incomeController.getIncomesByUserId(1L, 0);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(incomes, response.getBody());
	}

	// Test: Retrieve Incomes by Year, User ID, and Amendment Status
	@Test
	void testGetIncomesByYearAndUserId_Success() {
		List<Income> incomes = Arrays.asList(new Income(), new Income());
		when(incomeService.getIncomesByYearAndUserId(anyLong(), anyInt(), anyInt())).thenReturn(incomes);

		ResponseEntity<List<Income>> response = incomeController.getIncomesByYearAndUserId(1L, 2024, 0);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(incomes, response.getBody());
	}

	// Test: Add Multiple Incomes Failure
	@Test
	void testAddMultipleIncomes_Failure() {
		List<IncomeDTO> incomeDtoList = Arrays.asList(new IncomeDTO(), new IncomeDTO());

		when(incomeService.addMultipleIncomes(any())).thenThrow(new RuntimeException("Failed to add incomes"));

		try {
			incomeController.addMultipleIncomes(incomeDtoList);
		} catch (Exception e) {
			assertEquals("Failed to add incomes", e.getMessage());
		}
	}

	// Test: Update Income Details Failure
	@Test
	void testUpdateIncomeDetails_Failure() {
		List<IncomeDTO> updatedIncomes = Arrays.asList(new IncomeDTO());

		when(incomeService.updateIncomeDetails(anyLong(), any())).thenThrow(new RuntimeException("Update failed"));

		try {
			incomeController.updateIncomeDetails(1L, updatedIncomes);
		} catch (Exception e) {
			assertEquals("Update failed", e.getMessage());
		}
	}

	// Test: Delete Income Failure
	@Test
	void testDeleteIncome_Failure() {
		when(incomeService.deleteIncome(anyLong())).thenThrow(new RuntimeException("Delete operation failed"));

		try {
			incomeController.deleteIncome(1L);
		} catch (Exception e) {
			assertEquals("Delete operation failed", e.getMessage());
		}
	}

	// Test: Retrieve Incomes by User ID Failure
	@Test
	void testGetIncomesByUserId_Failure() {
		when(incomeService.getIncomesByUserId(anyLong(), anyInt()))
				.thenThrow(new RuntimeException("Failed to retrieve incomes"));

		try {
			incomeController.getIncomesByUserId(1L, 1);
		} catch (Exception e) {
			assertEquals("Failed to retrieve incomes", e.getMessage());
		}
	}

	// Test: Retrieve Incomes by Year and User ID Failure
	@Test
	void testGetIncomesByYearAndUserId_Failure() {
		when(incomeService.getIncomesByYearAndUserId(anyLong(), anyInt(), anyInt()))
				.thenThrow(new RuntimeException("Failed to retrieve incomes by year"));

		try {
			incomeController.getIncomesByYearAndUserId(1L, 2024, 1);
		} catch (Exception e) {
			assertEquals("Failed to retrieve incomes by year", e.getMessage());
		}
	}
}
