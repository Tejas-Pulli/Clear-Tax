package com.gov.tax.dto;

import java.math.BigDecimal;
import java.time.Year;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxFillingDTO {

	private Long userId;
	private String userName;
	private String governmentId;
	
	private Year taxYear;
	private BigDecimal grossIncome;
	private BigDecimal totalDeductions;
	private BigDecimal taxableIncome;
	private BigDecimal taxLiabillity;
	
	private String fillingStatus;
	private String refundStatus;
}
