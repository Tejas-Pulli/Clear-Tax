package com.gov.tax.service;

import java.io.IOException;
import java.math.BigDecimal;

import com.gov.tax.dto.RefundStatusUpdateRequest;
import com.gov.tax.entity.TaxRefund;
import com.itextpdf.text.DocumentException;

public interface TaxRefundService {

	void createRefund(Long userId, BigDecimal refundAmount);
	
	TaxRefund getTaxRefund(Long userId);

	TaxRefund updateRefundStatus(Long userId, RefundStatusUpdateRequest request);

	byte[] fetchRefundCertificate(Long userId) throws IOException, DocumentException;

}
