package com.gov.tax.entity;

import java.math.BigDecimal;
import java.time.Year;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Builder
@Data
@AllArgsConstructor(access = AccessLevel.PACKAGE)
@NoArgsConstructor(access = AccessLevel.PUBLIC)
public class TaxCalculation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long taxCalculationId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @Column(nullable = false)
    private BigDecimal grossIncome;

    @Column(nullable = false)
    private BigDecimal deductions;

    @Column(nullable = false)
    private BigDecimal taxableIncome;

    @Column(nullable = false)
    private BigDecimal taxLiability;

    @Column(nullable = false)
    private Year taxYear;

    @Column(nullable = false)
    private int isAmended;

    @ManyToOne
    @JoinColumn(name = "originalTaxCalculationId", referencedColumnName = "taxCalculationId")
    private TaxCalculation originalTaxCalculation; 
}
