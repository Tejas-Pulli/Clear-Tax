package com.gov.tax.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gov.tax.entity.TaxPayment;
import com.gov.tax.service.TaxPaymentService;
import com.razorpay.RazorpayException;

import lombok.RequiredArgsConstructor;

/**
 * Controller for handling tax payments, including tracking, payment processing,
 * verification, and receipt generation.
 */
@RestController
@RequestMapping("/api/track-payments")
@RequiredArgsConstructor
public class TaxPaymentController {

	private static final String CONTENT_TYPE = "Content-Type";
	private static final String APPLICATION_PDF = "application/pdf";
	private static final String CONTENT_DISPOSITION = "Content-Disposition";
	private static final String RECEIPT_FILENAME = "attachment; filename=tax_payment_receipt.pdf";
	private static final String SUMMARY_REPORT_FILENAME = "attachment; filename=tax_summary_report.pdf";
	private static final String TAX_TRANSCRIPT_FILENAME = "attachment; filename=tax_transcript.pdf";

	private final TaxPaymentService taxPaymentService;

	/**
	 * Retrieves tax payment details for a user.
	 *
	 * @param userId The user ID.
	 * @return ResponseEntity containing tax payment details.
	 */
	@GetMapping("/getTaxPaymentByUserId")
	public ResponseEntity<TaxPayment> getTaxPaymentByUserId(@RequestParam Long userId) {
		return ResponseEntity.ok(taxPaymentService.getTaxPaymentByUserId(userId));
	}

	/**
	 * Retrieves all tax payment records for a user.
	 *
	 * @param userId The user ID.
	 * @return ResponseEntity containing a list of tax payments.
	 */
	@GetMapping("/getAllTaxPaymentByUserId")
	public ResponseEntity<List<TaxPayment>> getAllTaxPaymentByUserId(@RequestParam Long userId) {
		return ResponseEntity.ok(taxPaymentService.getAllTaxPaymentByUserId(userId));
	}

	/**
	 * Retrieves tax payment details based on User ID and Transaction ID.
	 *
	 * @param userId        The user ID.
	 * @param transactionId The transaction ID.
	 * @return ResponseEntity containing tax payment details.
	 */
	@GetMapping("/getTaxPaymentByUserIdAndTransactionId")
	public ResponseEntity<TaxPayment> getTaxPaymentByUserIdAndTransactionId(@RequestParam Long userId,
			@RequestParam String transactionId) {
		return ResponseEntity.ok(taxPaymentService.getTaxPaymentByUserIdAndTransactionId(userId, transactionId));
	}

	/**
	 * Initiates tax payment via Razorpay.
	 *
	 * @param userId    The user ID.
	 * @param isAmended Indicates if the payment is for an amended tax.
	 * @return ResponseEntity containing tax payment details.
	 * @throws RazorpayException if the payment fails.
	 */
	@GetMapping("/pay")
	public ResponseEntity<TaxPayment> payTaxAtRazorpay(@RequestParam Long userId, @RequestParam int isAmended)
			throws RazorpayException {
		return ResponseEntity.ok(taxPaymentService.payTaxAtRazorpay(userId, isAmended));
	}

	/**
	 * Verifies a tax payment using Razorpay details.
	 *
	 * @param orderId           The Razorpay order ID.
	 * @param paymentId         The Razorpay payment ID.
	 * @param razorpaySignature The Razorpay signature.
	 * @return ResponseEntity containing verification status.
	 * @throws RazorpayException if verification fails.
	 */
	@PostMapping("/verify")
	public ResponseEntity<String> verifyPayment(@RequestParam String orderId, @RequestParam String paymentId,
			@RequestParam String razorpaySignature) throws RazorpayException {
		return ResponseEntity.ok(taxPaymentService.verifyPayment(orderId, paymentId, razorpaySignature));
	}

	/**
	 * Generates and downloads a tax payment receipt (PDF).
	 *
	 * @param userId        The user ID.
	 * @param transactionId The transaction ID.
	 * @return ResponseEntity containing the generated PDF.
	 */
	@PostMapping("/generate-recipt")
	public ResponseEntity<byte[]> downloadReceipt(@RequestParam Long userId, @RequestParam String transactionId) {
		try {
			return ResponseEntity.ok().header(CONTENT_TYPE, APPLICATION_PDF)
					.header(CONTENT_DISPOSITION, RECEIPT_FILENAME)
					.body(taxPaymentService.downloadReceipt(userId, transactionId));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}

	/**
	 * Creates and downloads a tax summary report (PDF).
	 *
	 * @param userId The user ID.
	 * @return ResponseEntity containing the generated PDF.
	 */
	@PostMapping("/create-summary-report")
	public ResponseEntity<byte[]> createTaxSummaryReport(@RequestParam Long userId) {
		try {
			return ResponseEntity.ok().header(CONTENT_TYPE, APPLICATION_PDF)
					.header(CONTENT_DISPOSITION, SUMMARY_REPORT_FILENAME)
					.body(taxPaymentService.createTaxSummaryReport(userId));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}

	/**
	 * Generates and downloads a tax transcript (PDF).
	 *
	 * @param userId The user ID.
	 * @return ResponseEntity containing the generated PDF.
	 */
	@PostMapping("/generateTaxTranscript")
	public ResponseEntity<byte[]> generateTaxTranscript(@RequestParam Long userId) {
		try {
			return ResponseEntity.ok().header(CONTENT_TYPE, APPLICATION_PDF)
					.header(CONTENT_DISPOSITION, TAX_TRANSCRIPT_FILENAME)
					.body(taxPaymentService.generateTaxTranscript(userId));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}
}
