package com.gov.tax.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Year;

@Data
@Builder
public class TaxCalculationDTO {
    private BigDecimal grossIncome;
    private BigDecimal deductions;
    private BigDecimal taxableIncome;
    private BigDecimal taxLiability;
    private Year taxYear;
    private int isAmended;
}
