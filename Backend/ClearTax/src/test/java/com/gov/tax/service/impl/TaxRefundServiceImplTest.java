package com.gov.tax.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gov.tax.dto.RefundStatusUpdateRequest;
import com.gov.tax.entity.TaxRefund;
import com.gov.tax.entity.User;
import com.gov.tax.exception.ResourceNotFoundException;
import com.gov.tax.mapper.UserMapper;
import com.gov.tax.repository.TaxRefundRepository;
import com.gov.tax.service.UserService;
import com.itextpdf.text.DocumentException;

@ExtendWith(MockitoExtension.class)
class TaxRefundServiceImplTest {

	@Mock
	private TaxRefundRepository taxRefundRepository;

	@Mock
	private UserMapper userMapper;

	@Mock
	private UserService userService;

	@InjectMocks
	private TaxRefundServiceImpl taxRefundService;

	private TaxRefund taxRefund;
	private Long userId;

	@Mock
	private User user;

	@BeforeEach
	void setUp() {
		userId = 1L;
		user.setUserId(userId);
		taxRefund = new TaxRefund();
		taxRefund.setUser(user);
		taxRefund.setRefundAmount(BigDecimal.valueOf(1000));

		// Mocking repository behavior
		when(taxRefundRepository.findByUserUserId(userId)).thenReturn(taxRefund);
	}

	@Test
	void testCreateRefund_Success() {
		lenient().when(taxRefundRepository.save(any(TaxRefund.class))).thenReturn(taxRefund);

		// Arrange
		BigDecimal refundAmount = BigDecimal.valueOf(1500);

		// Act
		taxRefundService.createRefund(userId, refundAmount);

		// Assert
		verify(taxRefundRepository, times(1)).save(any(TaxRefund.class));
	}

	@Test
	void testCreateRefund_Failure() {
		// Arrange
		BigDecimal refundAmount = BigDecimal.valueOf(-500); // Invalid amount

		// Act & Assert
		assertThrows(IllegalArgumentException.class, () -> taxRefundService.createRefund(userId, refundAmount));
	}

	@Test
	void testGetTaxRefund_Success() {
		// Act
		TaxRefund result = taxRefundService.getTaxRefund(userId);
		user.setUserId(userId);
		// Assert
		assertNotNull(result);
		assertEquals(userId, result.getUser().getUserId());
		assertEquals(BigDecimal.valueOf(1000), result.getRefundAmount());
	}

	@Test
	void testGetTaxRefund_NotFound() {
		// Arrange
		when(taxRefundRepository.findByUserUserId(userId)).thenReturn(null);

		// Act & Assert
		assertThrows(ResourceNotFoundException.class, () -> taxRefundService.getTaxRefund(userId));
	}

	@Test
	void testUpdateRefundStatus_Success() {
		// Arrange
		RefundStatusUpdateRequest request = new RefundStatusUpdateRequest();
		request.setRefundStatus("In Progress");

		// Mocking the behavior of taxRefundRepository.save() to return the updated tax
		// refund
		when(taxRefundRepository.save(any(TaxRefund.class))).thenReturn(taxRefund);

		// Act
		TaxRefund updatedRefund = taxRefundService.updateRefundStatus(userId, request);

		// Assert
		assertNotNull(updatedRefund); // Ensure the updated refund is not null
		assertEquals("In Progress", updatedRefund.getRefundStatus()); // Check if the status was updated correctly
		verify(taxRefundRepository, times(1)).save(updatedRefund); // Verify that the save method was called
	}

	@Test
	void testUpdateRefundStatus_Failure() {
		// Arrange
		RefundStatusUpdateRequest request = new RefundStatusUpdateRequest();
		request.setRefundStatus(""); // Invalid status

		// Act & Assert
		assertThrows(IllegalArgumentException.class, () -> taxRefundService.updateRefundStatus(userId, request));
	}

	@Test
	void testFetchRefundCertificate_Success() throws DocumentException, IOException {
		// Act
		taxRefund.setRefundDate(LocalDate.now());
		byte[] certificate = taxRefundService.fetchRefundCertificate(userId);

		// Assert
		assertNotNull(certificate);
	}

	@Test
	void testFetchRefundCertificate_DocumentException() {
		// Arrange
		when(taxRefundRepository.findByUserUserId(userId)).thenThrow(DocumentException.class);

		// Act & Assert
		assertThrows(DocumentException.class, () -> taxRefundService.fetchRefundCertificate(userId));
	}

	@Test
	void testFetchRefundCertificate_ResourceNotFoundException() {
		// Arrange
		when(taxRefundRepository.findByUserUserId(userId)).thenReturn(null);

		// Act & Assert
		assertThrows(ResourceNotFoundException.class, () -> taxRefundService.fetchRefundCertificate(userId));
	}

	@Test
	void testGetTaxRefund_WithDifferentUserId() {
		// Arrange
		Long differentUserId = 2L;
		lenient().when(taxRefundRepository.findByUserUserId(differentUserId)).thenReturn(null);

		// Act & Assert
		assertThrows(ResourceNotFoundException.class, () -> taxRefundService.getTaxRefund(differentUserId));
	}

	@Test
	void testUpdateRefundStatus_NullStatus() {
		// Arrange
		RefundStatusUpdateRequest request = new RefundStatusUpdateRequest();
		request.setRefundStatus(null);

		// Act & Assert
		assertThrows(IllegalArgumentException.class, () -> taxRefundService.updateRefundStatus(userId, request));
	}

	@Test
	void testCreateRefund_SuccessAfterPreviousFailure() {
		// Arrange
		BigDecimal refundAmount = BigDecimal.valueOf(2000);
		lenient().when(taxRefundRepository.save(any(TaxRefund.class))).thenReturn(taxRefund); // Using lenient()

		// Act
		taxRefundService.createRefund(userId, refundAmount);

		// Assert
		verify(taxRefundRepository, times(1)).save(any(TaxRefund.class));
	}

	@Test
	void testUpdateRefundStatus_Success_WithMultipleChanges() {
		// Arrange
		RefundStatusUpdateRequest request1 = new RefundStatusUpdateRequest();
		request1.setRefundStatus("In Progress");

		RefundStatusUpdateRequest request2 = new RefundStatusUpdateRequest();
		request2.setRefundStatus("Completed");

		// Act
		taxRefundService.updateRefundStatus(userId, request1);
		taxRefundService.updateRefundStatus(userId, request2);

		// Assert
		assertEquals("Completed", taxRefund.getRefundStatus());
		verify(taxRefundRepository, times(2)).save(any(TaxRefund.class));
	}
}
