package com.gov.tax.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gov.tax.dto.RefundStatusUpdateRequest;
import com.gov.tax.entity.TaxRefund;
import com.gov.tax.service.TaxRefundService;

import lombok.RequiredArgsConstructor;

/**
 * Controller for handling tax refund operations, including fetching refund
 * details, updating refund status, and generating refund certificates.
 */
@RestController
@RequestMapping("/api/tax-refund")
@RequiredArgsConstructor
public class TaxRefundController {

	private static final String CONTENT_TYPE = "Content-Type";
	private static final String APPLICATION_PDF = "application/pdf";
	private static final String CONTENT_DISPOSITION = "Content-Disposition";
	private static final String REFUND_CERTIFICATE_FILENAME = "attachment; filename=tax_refund_certificate.pdf";

	private final TaxRefundService taxRefundService;

	/**
	 * Retrieves tax refund details for a user.
	 *
	 * @param userId The user ID.
	 * @return ResponseEntity containing tax refund details.
	 */
	@GetMapping("/getTaxRefund")
	public ResponseEntity<TaxRefund> getTaxRefund(@RequestParam Long userId) {
		return ResponseEntity.ok(taxRefundService.getTaxRefund(userId));
	}

	/**
	 * Updates the tax refund status for a user.
	 *
	 * @param userId  The user ID.
	 * @param request The refund status update request.
	 * @return ResponseEntity containing updated tax refund details.
	 */
	@PutMapping("/update-status/{userId}")
	public ResponseEntity<TaxRefund> updateRefundStatus(@PathVariable Long userId,
			@RequestBody RefundStatusUpdateRequest request) {
		return ResponseEntity.ok(taxRefundService.updateRefundStatus(userId, request));
	}

	/**
	 * Generates and downloads a tax refund certificate as a PDF.
	 *
	 * @param userId The user ID.
	 * @return ResponseEntity containing the generated PDF.
	 */
	@PostMapping("/create-certificate")
	public ResponseEntity<byte[]> fetchRefundCertificate(@RequestParam Long userId) {
		try {
			return ResponseEntity.ok().header(CONTENT_TYPE, APPLICATION_PDF)
					.header(CONTENT_DISPOSITION, REFUND_CERTIFICATE_FILENAME)
					.body(taxRefundService.fetchRefundCertificate(userId));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}
}
