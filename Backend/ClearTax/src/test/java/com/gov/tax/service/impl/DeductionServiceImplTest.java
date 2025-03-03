package com.gov.tax.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.gov.tax.dto.DeductionDTO;
import com.gov.tax.entity.Deduction;
import com.gov.tax.entity.User;
import com.gov.tax.exception.ResourceNotFoundException;
import com.gov.tax.repository.DeductionRepository;
import com.gov.tax.repository.UserRepository;

class DeductionServiceImplTest {

    @InjectMocks
    private DeductionServiceImpl deductionService;

    @Mock
    private DeductionRepository deductionRepository;

    @Mock
    private UserRepository userRepository;

    private User user;
    private Deduction deduction;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        user = new User();
        user.setUserId(1L);

        deduction = Deduction.builder()
                .deductionId(1L)
                .user(user)
                .deductionType("Health Insurance")
                .amount(BigDecimal.valueOf(15000.00))
                .deductionDate(LocalDate.now())
                .isAmended(0)
                .build();
    }

    //Add Multiple Deductions - Success
    @Test
    void testAddMultipleDeductions_Success() {
        DeductionDTO deductionDTO = new DeductionDTO(1L, 1L, "Health Insurance", BigDecimal.valueOf(15000.00), LocalDate.now(), 0);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(deductionRepository.saveAll(any())).thenReturn(List.of(deduction));

        List<Deduction> result = deductionService.addMultipleDeductions(List.of(deductionDTO));

        assertEquals(1, result.size());
        verify(deductionRepository, times(1)).saveAll(any());
    }

    //Add Multiple Deductions - User Not Found
    @Test
    void testAddMultipleDeductions_UserNotFound() {
        DeductionDTO deductionDTO = new DeductionDTO(2L, 1L, "Health Insurance", BigDecimal.valueOf(15000.00), LocalDate.now(), 0);
        when(userRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> invokeAddMultipleDeductions(deductionDTO));
    }
    private void invokeAddMultipleDeductions(DeductionDTO deductionDTO) {
        deductionService.addMultipleDeductions(List.of(deductionDTO));
    }
    //Update Deduction - Success
    @Test
    void testUpdateDeduction_Success() {
        DeductionDTO updatedDeductionDTO = new DeductionDTO(2L, 1L, "Charitable Donation", BigDecimal.valueOf(25000.00), LocalDate.now(), 0);

        when(deductionRepository.findById(1L)).thenReturn(Optional.of(deduction));
        when(deductionRepository.save(any(Deduction.class))).thenReturn(deduction);

        Deduction result = deductionService.updateDeduction(1L, updatedDeductionDTO);

        assertEquals("Charitable Donation", result.getDeductionType());
        verify(deductionRepository, times(1)).save(any(Deduction.class));
    }

    //Update Deduction - Deduction Not Found
    @Test
    void testUpdateDeduction_NotFound() {
        when(deductionRepository.findById(2L)).thenReturn(Optional.empty());

        DeductionDTO updatedDeductionDTO =  new DeductionDTO(2L, 1L, "chairtable Donations", BigDecimal.valueOf(75000.00), LocalDate.now(), 0);

        assertThrows(ResourceNotFoundException.class, () -> deductionService.updateDeduction(2L, updatedDeductionDTO));
    }

    //Delete Deduction - Success
    @Test
    void testDeleteDeduction_Success() {
        when(deductionRepository.existsById(1L)).thenReturn(true);

        String response = deductionService.deleteDeduction(1L);

        assertEquals("Deduction Deleted ...!", response);
        verify(deductionRepository, times(1)).deleteById(1L);
    }

    //Delete Deduction - Deduction Not Found
    @Test
    void testDeleteDeduction_NotFound() {
        when(deductionRepository.existsById(2L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> deductionService.deleteDeduction(2L));
    }

    //Get Deductions by UserId and Amendment Status - Success
    @Test
    void testGetDeductionsByUserId_Success() {
        when(deductionRepository.findByUserUserIdAndIsAmended(1L, 0)).thenReturn(List.of(deduction));

        List<Deduction> result = deductionService.getDeductionsByUserId(1L, 0);

        assertFalse(result.isEmpty());
    }

    //Get Deductions by UserId and Amendment Status - No Deductions Found
    @Test
    void testGetDeductionsByUserId_NoDeductionsFound() {
        when(deductionRepository.findByUserUserIdAndIsAmended(1L, 0)).thenReturn(List.of());

        assertThrows(ResourceNotFoundException.class, () -> deductionService.getDeductionsByUserId(1L, 0));
    }

    //Get Deductions by Year and UserId - Success
    @Test
    void testGetDeductionsByYearAndUserId_Success() {
        when(deductionRepository.findByUserUserIdAndDeductionDateYearAndIsAmended(1L, LocalDate.now().getYear(), 0))
                .thenReturn(List.of(deduction));

        List<Deduction> result = deductionService.getDeductionsByYearAndUserId(1L, LocalDate.now().getYear(), 0);

        assertFalse(result.isEmpty());
    }

    //Get Deductions by Year and UserId - No Deductions Found
    @Test
    void testGetDeductionsByYearAndUserId_NoDeductionsFound() {
        when(deductionRepository.findByUserUserIdAndDeductionDateYearAndIsAmended(1L, LocalDate.now().getYear(), 0))
                .thenReturn(List.of());

        assertThrows(ResourceNotFoundException.class, this::callGetDeductions);
    }
        	private void callGetDeductions() {
        	    deductionService.getDeductionsByYearAndUserId(1L, LocalDate.now().getYear(), 0);
        	}

}
