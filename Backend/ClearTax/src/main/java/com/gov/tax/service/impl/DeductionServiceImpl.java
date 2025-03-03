package com.gov.tax.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.gov.tax.dto.DeductionDTO;
import com.gov.tax.entity.Deduction;
import com.gov.tax.entity.User;
import com.gov.tax.exception.ResourceNotFoundException;
import com.gov.tax.repository.DeductionRepository;
import com.gov.tax.repository.UserRepository;
import com.gov.tax.service.DeductionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeductionServiceImpl implements DeductionService {

	private final DeductionRepository deductionRepository;
	private final UserRepository userRepository;

	/**
	 * Adds multiple deductions for users.
	 * 
	 * @param deductionDtoList - List of DeductionDTO containing deduction details.
	 * @return List of saved Deduction entities.
	 */
	@Override
	public List<Deduction> addMultipleDeductions(List<DeductionDTO> deductionDtoList) {
		List<Deduction> deductions = new ArrayList<>();
		for (DeductionDTO deductionDto : deductionDtoList) {
			// Fetch the user by userId or throw an exception if not found
			User user = userRepository.findById(deductionDto.getUserId())
					.orElseThrow(() -> new ResourceNotFoundException("User not found"));

			// Create a Deduction entity from the DTO
			Deduction deduction = Deduction.builder().user(user).deductionType(deductionDto.getDeductionType())
					.amount(deductionDto.getAmount()).deductionDate(deductionDto.getDeductionDate())
					.isAmended(deductionDto.getIsAmended()).build();

			// Add to the deductions list
			deductions.add(deduction);
		}
		// Save all deductions to the database
		return deductionRepository.saveAll(deductions);
	}

	/**
	 * Updates an existing deduction.
	 * 
	 * @param deductionId  - ID of the deduction to be updated.
	 * @param deductionDto - DeductionDTO containing updated deduction details.
	 * @return The updated Deduction entity.
	 */
	@Override
	public Deduction updateDeduction(Long deductionId, DeductionDTO deductionDto) {
		// Fetch the deduction by ID or throw an exception if not found
		Deduction existingDeduction = deductionRepository.findById(deductionId)
				.orElseThrow(() -> new ResourceNotFoundException("Deduction not found"));

		// Update deduction details
		existingDeduction.setDeductionType(deductionDto.getDeductionType());
		existingDeduction.setAmount(deductionDto.getAmount());
		existingDeduction.setDeductionDate(deductionDto.getDeductionDate());

		// Save and return the updated deduction
		return deductionRepository.save(existingDeduction);
	}

	/**
	 * Deletes a deduction by its ID.
	 * 
	 * @param deductionId - ID of the deduction to be deleted.
	 * @return Success message confirming deletion.
	 */
	@Override
	public String deleteDeduction(Long deductionId) {
		// Check if the deduction exists
		if (!deductionRepository.existsById(deductionId)) {
			throw new ResourceNotFoundException("Deduction not found");
		}
		// Delete the deduction
		deductionRepository.deleteById(deductionId);
		return "Deduction Deleted ...!";
	}

	/**
	 * Retrieves deductions for a user based on their ID and amendment status.
	 * 
	 * @param userId    - ID of the user whose deductions need to be fetched.
	 * @param isAmended - Amendment status of deductions (0 for new, 1 for amended).
	 * @return List of deductions for the user.
	 */
	@Override
	public List<Deduction> getDeductionsByUserId(Long userId, int isAmended) {
		// Fetch deductions based on user ID and amendment status
		List<Deduction> deductions = deductionRepository.findByUserUserIdAndIsAmended(userId, isAmended);
		if (deductions.isEmpty()) {
			throw new ResourceNotFoundException("No Deductions Found");
		}
		return deductions;
	}

	/**
	 * Retrieves deductions for a user based on their ID, year, and amendment
	 * status.
	 * 
	 * @param userId    - ID of the user whose deductions need to be fetched.
	 * @param year      - The year for which deductions are to be retrieved.
	 * @param isAmended - Amendment status of deductions (0 for new, 1 for amended).
	 * @return List of deductions for the user in the specified year.
	 */
	@Override
	public List<Deduction> getDeductionsByYearAndUserId(Long userId, int year, int isAmended) {
		// Fetch deductions based on user ID, year, and amendment status
		List<Deduction> deductions = deductionRepository.findByUserUserIdAndDeductionDateYearAndIsAmended(userId, year,
				isAmended);
		if (deductions.isEmpty()) {
			throw new ResourceNotFoundException("No Deductions Found");
		}
		return deductions;
	}
}
