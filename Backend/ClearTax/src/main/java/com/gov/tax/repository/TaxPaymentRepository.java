package com.gov.tax.repository;

import com.gov.tax.entity.TaxPayment;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaxPaymentRepository extends JpaRepository<TaxPayment, Integer> {
	TaxPayment findByUserUserId(Long userId);

	TaxPayment findByTransactionId(String orderId);

	List<TaxPayment> findAllByUserUserId(Long userId);

	TaxPayment findByUserUserIdAndTransactionId(Long userId, String transactionId);

	TaxPayment findByUserUserIdAndAmountPaid(Long userId, BigDecimal amountPaid);
}
