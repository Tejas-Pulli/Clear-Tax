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
public class DeductionDTO {
	private Long deductionId;
	private Long userId;
	private String deductionType;
	private BigDecimal amount;
	private LocalDate deductionDate;
	private int isAmended;
}
