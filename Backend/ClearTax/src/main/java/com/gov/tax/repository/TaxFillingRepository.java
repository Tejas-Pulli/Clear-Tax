package com.gov.tax.repository;

import java.time.Year;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.gov.tax.entity.TaxFilling;

@Repository
public interface TaxFillingRepository extends JpaRepository<TaxFilling, Integer> {
	// Find tax filing by userId and taxYear
    Optional<TaxFilling> findByUserUserIdAndTaxYear(Long userId, Year taxYear);
    
    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END " +
            "FROM TaxFilling t WHERE t.user.userId = :userId AND t.taxYear = :taxYear AND t.pdfGenerated = true")
     boolean isPdfGeneratedForUserAndYear(Long userId, Year taxYear);

     @Query("UPDATE TaxFilling t SET t.pdfGenerated = true WHERE t.user.userId = :userId AND t.taxYear = :taxYear")
     void updatePdfGeneratedStatus(Long userId, Year taxYear, boolean status);

     @Query("UPDATE TaxFilling t SET t.fillingStatus = :status WHERE t.user.userId = :userId AND t.taxYear = :taxYear")
     void updateFilingStatus(Long userId, Year taxYear, String status);

	List<TaxFilling> findAllByUserUserId(Long userId);
 }
