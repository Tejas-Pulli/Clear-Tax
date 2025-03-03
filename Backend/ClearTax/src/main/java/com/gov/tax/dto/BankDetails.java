package com.gov.tax.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BankDetails {
	private String accountNumber;
	private String bankName;
	private String ifscCode;

}
