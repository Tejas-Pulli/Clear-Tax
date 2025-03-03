package com.gov.tax.repository;

import java.time.Year;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gov.tax.entity.TaxCalculation;

@Repository
public interface TaxCalculationRepository extends JpaRepository<TaxCalculation, Long> {

	// Fetch tax calculation details by userId and taxYear
	Optional<TaxCalculation> findByUserUserIdAndTaxYear(Long userId, int taxYear);
	
	// Fetch tax calculation details by userId and taxYear
	Optional<TaxCalculation> findByUserUserIdAndTaxYearAndIsAmended(Long userId, Year taxYear,int isAmended);
	

	// get tax details
	Optional<List<TaxCalculation>> findByUserUserId(Long userId);

	Optional<TaxCalculation> findByUserUserIdAndTaxYear(Long userId, Year taxYear);
}
