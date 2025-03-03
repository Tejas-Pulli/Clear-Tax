package com.gov.tax.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.gov.tax.dto.IncomeDTO;
import com.gov.tax.entity.Income;
import com.gov.tax.entity.User;
import com.gov.tax.exception.ResourceNotFoundException;
import com.gov.tax.repository.IncomeRepository;
import com.gov.tax.repository.UserRepository;
import com.gov.tax.service.IncomeService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IncomeServiceImpl implements IncomeService {

	private final IncomeRepository incomeRepository;
	private final UserRepository userRepository;

	/**
	 * Adds multiple incomes for users.
	 * 
	 * @param incomeDtoList - List of IncomeDTO containing income details.
	 * @return List of saved Income entities.
	 */
	@Override
	public List<Income> addMultipleIncomes(List<IncomeDTO> incomeDtoList) {
		List<Income> incomes = new ArrayList<>();

		// Loop through the income list and save each income
		for (IncomeDTO incomeDto : incomeDtoList) {
			User user = userRepository.findById(incomeDto.getUserId())
					.orElseThrow(() -> new ResourceNotFoundException("User not found"));

			// Create an Income entity from the DTO
			Income income = Income.builder().user(user).incomeSource(incomeDto.getIncomeSource())
					.amount(incomeDto.getAmount()).incomeDate(incomeDto.getIncomeDate())
					.isAmended(incomeDto.getIsAmended()).build();

			incomes.add(income);
		}
		return incomeRepository.saveAll(incomes);
	}

	/**
	 * Updates an existing income record.
	 * 
	 * @param incomeId - ID of the income to be updated.
	 * @param income   - Income entity containing updated income details.
	 * @return The updated Income entity.
	 */
	@Override
	public Income updateIncome(Long incomeId, Income income) {
		// Fetch the income by ID or throw an exception if not found
		Optional<Income> existingIncome = incomeRepository.findById(incomeId);

		if (!existingIncome.isPresent()) {
			throw new ResourceNotFoundException("Income not found");
		}

		// Update income details
		Income updatedIncome = existingIncome.get();
		updatedIncome.setIncomeSource(income.getIncomeSource());
		updatedIncome.setAmount(income.getAmount());
		updatedIncome.setIncomeDate(income.getIncomeDate());

		// Save and return the updated income
		return incomeRepository.save(updatedIncome);
	}

	/**
	 * Deletes an income by its ID.
	 * 
	 * @param incomeId - ID of the income to be deleted.
	 * @return Success message confirming deletion.
	 */
	@Override
	public String deleteIncome(Long incomeId) {
		// Check if the income exists
		if (!incomeRepository.existsById(incomeId)) {
			throw new ResourceNotFoundException("Income not found");
		}
		// Delete the income
		incomeRepository.deleteById(incomeId);
		return "Income Deleted Successfully..!";
	}

	/**
	 * Retrieves all incomes for a specific user based on amendment status.
	 * 
	 * @param userId    - ID of the user whose incomes need to be fetched.
	 * @param isAmended - Amendment status of incomes (0 for new, 1 for amended).
	 * @return List of incomes for the user.
	 */
	@Override
	public List<Income> getIncomesByUserId(Long userId, int isAmended) {
		// Fetch incomes based on user ID and amendment status
		return incomeRepository.findByUserUserIdAndIsAmended(userId, isAmended);
	}

	/**
	 * Retrieves all incomes for a user for a specific year based on amendment
	 * status.
	 * 
	 * @param userId    - ID of the user whose incomes need to be fetched.
	 * @param year      - The year for which incomes are to be retrieved.
	 * @param isAmended - Amendment status of incomes (0 for new, 1 for amended).
	 * @return List of incomes for the user in the specified year.
	 */
	@Override
	public List<Income> getIncomesByYearAndUserId(Long userId, int year, int isAmended) {
		// Fetch incomes based on user ID, year, and amendment status
		return incomeRepository.findByUserUserIdAndIncomeDateYearAndIsAmended(userId, year, isAmended);
	}

	/**
	 * Updates income records for a user for the current year.
	 * 
	 * @param userId         - ID of the user whose income records need to be
	 *                       updated.
	 * @param updatedIncomes - List of IncomeDTO containing updated income details.
	 * @return Success message confirming update.
	 */
	public String updateIncomeDetails(Long userId, List<IncomeDTO> updatedIncomes) {
		// Fetch the user by userId or throw an exception if not found
		User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

		int currentYear = LocalDate.now().getYear();

		// Delete existing incomes for the current year before updating
		incomeRepository.deleteByUserUserIdAndIncomeDateYear(userId, currentYear);

		// Save the updated incomes
		for (IncomeDTO incomeDTO : updatedIncomes) {
			Income income = new Income();
			income.setUser(user);
			income.setIncomeSource(incomeDTO.getIncomeSource());
			income.setAmount(incomeDTO.getAmount());
			income.setIncomeDate(incomeDTO.getIncomeDate());

			incomeRepository.save(income);
		}
		return "Income Updated Successfully";
	}

	/**
	 * Deletes all incomes for a user for a specific year.
	 * 
	 * @param userId - ID of the user whose incomes need to be deleted.
	 * @param year   - The year for which incomes are to be deleted.
	 * @return Success message confirming deletion.
	 */
	@Override
	public String deleteIncomesByUserIdAndYear(Long userId, int year) {
		// Fetch existing incomes for the given year
		List<Income> existingIncomes = incomeRepository.findByUserUserIdAndIncomeDateYear(userId, year);

		if (existingIncomes.isEmpty()) {
			throw new ResourceNotFoundException("No incomes found for the given year");
		}

		// Delete all incomes for the given year
		incomeRepository.deleteAll(existingIncomes);
		return "Income Deleted Successfully...!";
	}
}
