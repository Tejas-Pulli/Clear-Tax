package com.gov.tax.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TaxRefundDTO {
    private BigDecimal refundAmount;
    private String refundDate;
    private String refundStatus;
    private int userId;
}
