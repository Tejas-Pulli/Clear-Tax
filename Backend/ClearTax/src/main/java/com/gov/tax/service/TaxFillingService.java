package com.gov.tax.service;

import java.io.IOException;
import java.time.Year;
import java.util.List;

import com.gov.tax.dto.TaxFillingDTO;
import com.gov.tax.entity.TaxFilling;
import com.itextpdf.text.DocumentException;

public interface TaxFillingService {

	boolean checkIfTaxCalculationExists(Long userId, Year taxYear);

	String submitTaxReturn(Long userId, Year taxYear);

	byte[] generateTaxFillingPdf(TaxFillingDTO taxFillingDTO) throws IOException, DocumentException;

	boolean isPdfGenerated(Long userId, Year taxYear);

	String getFillingStatus(Long userId, Year taxYear);

	byte[] createTaxFillingPdf(TaxFillingDTO taxFillingDTO) throws IOException, DocumentException;

	List<TaxFilling> getTaxFillingHistory(Long userId);

}
