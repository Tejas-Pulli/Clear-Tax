package com.gov.tax.dto;

import java.math.BigDecimal;
import java.util.List;

import com.gov.tax.entity.Deduction;
import com.gov.tax.entity.Income;
import com.gov.tax.entity.User;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AmendmentRequestDTO {
	private List<Income> incomes;
	private List<Deduction> deductions;
	private int originalTaxCalculationId;
	private BigDecimal taxLiability;
	private BigDecimal taxableIncome;
	private BigDecimal totalDeductions;
	private BigDecimal totalIncome;
	private int isAmended;
	private int taxYear;
	private User user;
}
