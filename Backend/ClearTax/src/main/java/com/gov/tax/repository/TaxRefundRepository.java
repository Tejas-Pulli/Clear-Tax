package com.gov.tax.repository;

import com.gov.tax.entity.TaxRefund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaxRefundRepository extends JpaRepository<TaxRefund, Integer> {

	TaxRefund findByUserUserId(Long userId);

}
