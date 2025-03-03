package com.gov.tax.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gov.tax.entity.Deduction;

@Repository
public interface DeductionRepository extends JpaRepository<Deduction, Long> {
	public List<Deduction> findByUserUserId(Long userId);

	@Query("SELECT d FROM Deduction d WHERE d.user.userId = :userId AND YEAR(d.deductionDate) = :year")
	public List<Deduction> findByUserUserIdAndDeductionDateYear(Long userId, int year);

    @Query("SELECT i FROM Deduction i WHERE i.user.userId = :userId AND YEAR(i.deductionDate) = :year AND i.isAmended = :isAmended")
	public List<Deduction> findByUserUserIdAndDeductionDateYearAndIsAmended(
			 @Param("userId") Long userId, 
		        @Param("year") int year,
		        @Param("isAmended") int isAmended);

	public List<Deduction> findByUserUserIdAndIsAmended(Long userId, int isAmended);

}
