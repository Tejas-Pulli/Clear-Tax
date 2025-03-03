package com.gov.tax.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
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
public class TaxPayment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long taxPaymentId;

	@ManyToOne(optional = false)
	@JoinColumn(name = "userId", nullable = false)
	private User user;

	private LocalDate paymentDate;

	@Column(nullable = false)
	private BigDecimal amountPaid;

	private String paymentStatus;
	private String transactionId;
	
	@OneToOne
	@JoinColumn(name = "taxCalculationId")
	private TaxCalculation taxCalculation;
}
