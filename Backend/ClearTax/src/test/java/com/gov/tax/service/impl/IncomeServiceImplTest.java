package com.gov.tax.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.gov.tax.dto.IncomeDTO;
import com.gov.tax.entity.Income;
import com.gov.tax.entity.User;
import com.gov.tax.exception.ResourceNotFoundException;
import com.gov.tax.repository.IncomeRepository;
import com.gov.tax.repository.UserRepository;

class IncomeServiceImplTest {

	@InjectMocks
	private IncomeServiceImpl incomeService;

	@Mock
	private IncomeRepository incomeRepository;

	@Mock
	private UserRepository userRepository;

	private User user;
	private Income income;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
		user = new User();
		user.setUserId(1L);

		income = Income.builder().incomeId(1L).user(user).incomeSource("Salary").amount(BigDecimal.valueOf(50000.00))
				.incomeDate(LocalDate.now()).isAmended(0).build();
	}

	// Test: Add Multiple Incomes - Success
	@Test
	void testAddMultipleIncomes_Success() {
		IncomeDTO incomeDTO = new IncomeDTO(1L, 1L, "Salary", BigDecimal.valueOf(50000.00), LocalDate.now(), 0);

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(incomeRepository.saveAll(any())).thenReturn(List.of(income));

		List<Income> result = incomeService.addMultipleIncomes(List.of(incomeDTO));

		assertEquals(1, result.size());
		verify(incomeRepository, times(1)).saveAll(any());
	}

	// Test: Add Multiple Incomes - User Not Found
	@Test
	void testAddMultipleIncomes_UserNotFound() {
	    IncomeDTO incomeDTO = new IncomeDTO(1L, 1L, "Salary", BigDecimal.valueOf(50000.00), LocalDate.now(), 0);
	    when(userRepository.findById(2L)).thenReturn(Optional.empty());

	    assertThrows(ResourceNotFoundException.class, () -> invokeAddMultipleIncomes(incomeDTO));
	}

	private void invokeAddMultipleIncomes(IncomeDTO incomeDTO) {
	    incomeService.addMultipleIncomes(List.of(incomeDTO));
	}

	// Test: Update Income - Success
	@Test
	void testUpdateIncome_Success() {
		Income updatedIncome = Income.builder().incomeSource("Bonus").amount(BigDecimal.valueOf(10000.00))
				.incomeDate(LocalDate.now()).build();

		when(incomeRepository.findById(1L)).thenReturn(Optional.of(income));
		when(incomeRepository.save(any(Income.class))).thenReturn(updatedIncome);

		Income result = incomeService.updateIncome(1L, updatedIncome);

		assertEquals("Bonus", result.getIncomeSource());
		verify(incomeRepository, times(1)).save(any(Income.class));
	}

	// Test: Update Income - Income Not Found
	@Test
	void testUpdateIncome_NotFound() {
		when(incomeRepository.findById(2L)).thenReturn(Optional.empty());

		Income updatedIncome = Income.builder().incomeSource("Bonus").amount(BigDecimal.valueOf(10000.00))
				.incomeDate(LocalDate.now()).build();

		assertThrows(ResourceNotFoundException.class, () -> incomeService.updateIncome(2L, updatedIncome));
	}

	// Test: Delete Income - Success
	@Test
	void testDeleteIncome_Success() {
		when(incomeRepository.existsById(1L)).thenReturn(true);

		String response = incomeService.deleteIncome(1L);

		assertEquals("Income Deleted Successfully..!", response);
		verify(incomeRepository, times(1)).deleteById(1L);
	}

	// Test: Delete Income - Income Not Found
	@Test
	void testDeleteIncome_NotFound() {
		when(incomeRepository.existsById(2L)).thenReturn(false);

		assertThrows(ResourceNotFoundException.class, () -> incomeService.deleteIncome(2L));
	}

	// Test: Get Incomes by UserId and Amendment Status - Success
	@Test
	void testGetIncomesByUserId_Success() {
		when(incomeRepository.findByUserUserIdAndIsAmended(1L, 0)).thenReturn(List.of(income));

		List<Income> result = incomeService.getIncomesByUserId(1L, 0);

		assertFalse(result.isEmpty());
	}

	// Test: Delete Incomes by UserId and Year - Success
	@Test
	void testDeleteIncomesByUserIdAndYear_Success() {
		when(incomeRepository.findByUserUserIdAndIncomeDateYear(1L, LocalDate.now().getYear()))
				.thenReturn(List.of(income));

		String response = incomeService.deleteIncomesByUserIdAndYear(1L, LocalDate.now().getYear());

		assertEquals("Income Deleted Successfully...!", response);
		verify(incomeRepository, times(1)).deleteAll(any());
	}

	// Test: Delete Incomes by UserId and Year - No Records Found
	@Test
	void testDeleteIncomesByUserIdAndYear_NoRecords() {
	    when(incomeRepository.findByUserUserIdAndIncomeDateYear(1L, LocalDate.now().getYear())).thenReturn(List.of());

	    assertThrows(ResourceNotFoundException.class, this::invokeDeleteIncomes);
	}

	private void invokeDeleteIncomes() {
	    incomeService.deleteIncomesByUserIdAndYear(1L, LocalDate.now().getYear());
	}

	// Test: Update Income Details - Success
	@Test
	void testUpdateIncomeDetails_Success() {
		IncomeDTO incomeDTO = new IncomeDTO(2L, 1L, "Salary", BigDecimal.valueOf(20000.00), LocalDate.now(), 0);

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		doNothing().when(incomeRepository).deleteByUserUserIdAndIncomeDateYear(1L, LocalDate.now().getYear());
		when(incomeRepository.save(any())).thenReturn(income);

		String response = incomeService.updateIncomeDetails(1L, List.of(incomeDTO));

		assertEquals("Income Updated Successfully", response);
		verify(incomeRepository, times(1)).save(any(Income.class));
	}

	// Test: Update Income Details - User Not Found
	@Test
	void testUpdateIncomeDetails_UserNotFound() {
	    when(userRepository.findById(2L)).thenReturn(Optional.empty());

	    assertThrows(ResourceNotFoundException.class, this::invokeUpdateIncomeDetails);
	}

	private void invokeUpdateIncomeDetails() {
	    incomeService.updateIncomeDetails(2L, List.of(new IncomeDTO(2L, 1L, "Salary", BigDecimal.valueOf(20000.00), LocalDate.now(), 0)));
	}

	
}
