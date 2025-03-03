package com.gov.tax.service;

import java.util.List;

import com.gov.tax.dto.DeductionDTO;
import com.gov.tax.entity.Deduction;

public interface DeductionService {

	List<Deduction> addMultipleDeductions(List<DeductionDTO> deductionDtoList);
	Deduction updateDeduction(Long deductionId, DeductionDTO deductionDto);
	String deleteDeduction(Long deductionId);
	List<Deduction> getDeductionsByUserId(Long userId, int isAmended);
	List<Deduction> getDeductionsByYearAndUserId(Long userId, int year, int isAmended);
	
}
