package com.gov.tax.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gov.tax.entity.Income;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {
	public List<Income> findByUserUserId(Long userId);

	// Get incomes by userId where isAmended = 0
	public List<Income> findByUserUserIdAndIsAmended(Long userId, int isAmended);

	// Get incomes by userId and year where isAmended = 0
	@Query("SELECT i FROM Income i WHERE i.user.userId = :userId AND YEAR(i.incomeDate) = :year AND i.isAmended = :isAmended")
	List<Income> findByUserUserIdAndIncomeDateYearAndIsAmended(@Param("userId") Long userId, @Param("year") int year,
			@Param("isAmended") int isAmended);

	@Query("SELECT i FROM Income i WHERE i.user.userId = :userId AND YEAR(i.incomeDate) = :year")
	public List<Income> findByUserUserIdAndIncomeDateYear(Long userId, int year);

	@Query("DELETE FROM Income i WHERE i.user.userId = :userId AND YEAR(i.incomeDate) = :year")
	void deleteByUserUserIdAndIncomeDateYear(Long userId, int year);

}
