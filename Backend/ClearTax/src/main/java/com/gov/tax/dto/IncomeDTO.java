package com.gov.tax.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class IncomeDTO {
	private Long incomeId;
	private Long userId;
	private String incomeSource;
	private BigDecimal amount;
	private LocalDate incomeDate;
	private int isAmended;
}