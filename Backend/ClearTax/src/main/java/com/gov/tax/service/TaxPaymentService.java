package com.gov.tax.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

import com.gov.tax.entity.TaxPayment;
import com.itextpdf.text.DocumentException;
import com.razorpay.RazorpayException;

public interface TaxPaymentService {

	TaxPayment getTaxPaymentByUserId(Long userId);

	List<TaxPayment> getAllTaxPaymentByUserId(Long userId);

	String verifyPayment(String orderId, String paymentId, String razorpaySignature) throws RazorpayException;

	TaxPayment getTaxPaymentByUserIdAndTransactionId(Long userId, String transactionId);

	byte[] downloadReceipt(Long userId, String transactionId) throws DocumentException, IOException;

	byte[] createTaxSummaryReport(Long userId) throws IOException, DocumentException;

	byte[] generateTaxTranscript(Long userId) throws IOException, DocumentException;

	void createPayment(Long userId, BigDecimal amount);

	TaxPayment payTaxAtRazorpay(Long userId, int isAmended) throws RazorpayException;

}
