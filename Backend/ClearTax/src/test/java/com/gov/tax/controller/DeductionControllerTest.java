package com.gov.tax.controller;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

import com.gov.tax.dto.DeductionDTO;
import com.gov.tax.entity.Deduction;
import com.gov.tax.service.DeductionService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

class DeductionControllerTest {

    @Mock
    private DeductionService deductionService;

    @InjectMocks
    private DeductionController deductionController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    //  Test: Add Multiple Deductions Successfully
    @Test
    void testAddMultipleDeductions_Success() {
        List<DeductionDTO> deductionDtoList = Arrays.asList(new DeductionDTO(), new DeductionDTO());
        List<Deduction> deductions = Arrays.asList(new Deduction(), new Deduction());

        when(deductionService.addMultipleDeductions(any())).thenReturn(deductions);

        ResponseEntity<List<Deduction>> response = deductionController.addMultipleDeductions(deductionDtoList);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(deductions, response.getBody());
    }

    //  Test: Update Deduction by ID Successfully
    @Test
    void testUpdateDeduction_Success() {
        DeductionDTO deductionDTO = new DeductionDTO();
        Deduction deduction = new Deduction();

        when(deductionService.updateDeduction(anyLong(), any())).thenReturn(deduction);

        ResponseEntity<Deduction> response = deductionController.updateDeduction(1L, deductionDTO);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(deduction, response.getBody());
    }

    //  Test: Delete Deduction by ID Successfully
    @Test
    void testDeleteDeduction_Success() {
        when(deductionService.deleteDeduction(anyLong())).thenReturn("Deduction deleted successfully");

        ResponseEntity<String> response = deductionController.deleteDeduction(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Deduction deleted successfully", response.getBody());
    }

    //  Test: Get Deductions by User ID and Amendment Status Successfully
    @Test
    void testGetDeductionsByUserId_Success() {
        List<Deduction> deductions = Arrays.asList(new Deduction(), new Deduction());

        when(deductionService.getDeductionsByUserId(anyLong(), anyInt())).thenReturn(deductions);

        ResponseEntity<List<Deduction>> response = deductionController.getDeductionsByUserId(1L, 0);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(deductions, response.getBody());
    }

    //  Test: Get Deductions by Year, User ID, and Amendment Status Successfully
    @Test
    void testGetDeductionsByYearAndUserId_Success() {
        List<Deduction> deductions = Arrays.asList(new Deduction(), new Deduction());

        when(deductionService.getDeductionsByYearAndUserId(anyLong(), anyInt(), anyInt())).thenReturn(deductions);

        ResponseEntity<List<Deduction>> response = deductionController.getDeductionsByYearAndUserId(1L, 2024, 1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(deductions, response.getBody());
    }

    //  Test: Add Multiple Deductions Failure
    @Test
    void testAddMultipleDeductions_Failure() {
        List<DeductionDTO> deductionDtoList = Arrays.asList(new DeductionDTO(), new DeductionDTO());

        when(deductionService.addMultipleDeductions(any())).thenThrow(new RuntimeException("Failed to add deductions"));

        try {
            deductionController.addMultipleDeductions(deductionDtoList);
        } catch (Exception e) {
            assertEquals("Failed to add deductions", e.getMessage());
        }
    }

    //  Test: Update Deduction Failure
    @Test
    void testUpdateDeduction_Failure() {
        DeductionDTO deductionDTO = new DeductionDTO();

        when(deductionService.updateDeduction(anyLong(), any())).thenThrow(new RuntimeException("Update failed"));

        try {
            deductionController.updateDeduction(1L, deductionDTO);
        } catch (Exception e) {
            assertEquals("Update failed", e.getMessage());
        }
    }

    //  Test: Delete Deduction Failure
    @Test
    void testDeleteDeduction_Failure() {
        when(deductionService.deleteDeduction(anyLong())).thenThrow(new RuntimeException("Delete failed"));

        try {
            deductionController.deleteDeduction(1L);
        } catch (Exception e) {
            assertEquals("Delete failed", e.getMessage());
        }
    }

    //  Test: Get Deductions by User ID Failure
    @Test
    void testGetDeductionsByUserId_Failure() {
        when(deductionService.getDeductionsByUserId(anyLong(), anyInt())).thenThrow(new RuntimeException("Failed to retrieve deductions"));

        try {
            deductionController.getDeductionsByUserId(1L, 0);
        } catch (Exception e) {
            assertEquals("Failed to retrieve deductions", e.getMessage());
        }
    }

    //  Test: Get Deductions by Year and User ID Failure
    @Test
    void testGetDeductionsByYearAndUserId_Failure() {
        when(deductionService.getDeductionsByYearAndUserId(anyLong(), anyInt(), anyInt()))
                .thenThrow(new RuntimeException("Failed to retrieve deductions by year"));

        try {
            deductionController.getDeductionsByYearAndUserId(1L, 2024, 1);
        } catch (Exception e) {
            assertEquals("Failed to retrieve deductions by year", e.getMessage());
        }
    }
}

