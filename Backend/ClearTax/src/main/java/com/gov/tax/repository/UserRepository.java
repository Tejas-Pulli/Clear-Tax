package com.gov.tax.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gov.tax.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	boolean existsByEmail(String email);
    boolean existsByGovernmentId(String governmentId);
    Optional<User> findByEmail(String email);
	int countByUserRole(String string);
}
