package com.gov.tax.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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
public class TaxRefund {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long taxRefundId;

	@OneToOne(optional = false)
	@JoinColumn(name = "userId", nullable = false)
	private User user;

	@Column(nullable = false)
	private BigDecimal refundAmount;

	@Column(nullable = false)
	private LocalDate refundDate;

	@Column(nullable = false)
	private String refundStatus;
}
