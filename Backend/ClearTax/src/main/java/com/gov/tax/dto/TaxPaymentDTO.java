package com.gov.tax.dto;

import java.math.BigDecimal;

import com.gov.tax.entity.User;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TaxPaymentDTO {
    private String paymentDate; 
    private BigDecimal amountPaid;
    private String paymentStatus;
    private String transactionId;
    private User user;
}
