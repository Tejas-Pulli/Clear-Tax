package com.gov.tax.service;

import java.util.List;

import com.gov.tax.dto.IncomeDTO;
import com.gov.tax.entity.Income;

public interface IncomeService {
	List<Income> addMultipleIncomes(List<IncomeDTO> incomeDtoList);
	Income updateIncome(Long incomeId, Income income);
	String deleteIncome(Long incomeId);
	String updateIncomeDetails(Long userId, List<IncomeDTO> updatedIncome);
	String deleteIncomesByUserIdAndYear(Long userId, int year);
	List<Income> getIncomesByYearAndUserId(Long userId, int year, int isAmended);
	List<Income> getIncomesByUserId(Long userId, int isAmended);

}
