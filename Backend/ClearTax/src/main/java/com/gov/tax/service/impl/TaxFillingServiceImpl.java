package com.gov.tax.service.impl;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.gov.tax.dto.TaxFillingDTO;
import com.gov.tax.entity.Deduction;
import com.gov.tax.entity.Income;
import com.gov.tax.entity.TaxCalculation;
import com.gov.tax.entity.TaxFilling;
import com.gov.tax.entity.TaxPayment;
import com.gov.tax.entity.User;
import com.gov.tax.exception.ResourceAlreadyExistsException;
import com.gov.tax.exception.ResourceNotFoundException;
import com.gov.tax.repository.TaxCalculationRepository;
import com.gov.tax.repository.TaxFillingRepository;
import com.gov.tax.repository.TaxPaymentRepository;
import com.gov.tax.repository.UserRepository;
import com.gov.tax.service.DeductionService;
import com.gov.tax.service.IncomeService;
import com.gov.tax.service.TaxFillingService;
import com.itextpdf.io.source.ByteArrayOutputStream;
import com.itextpdf.text.BadElementException;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.Image;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.ColumnText;
import com.itextpdf.text.pdf.PdfContentByte;
import com.itextpdf.text.pdf.PdfGState;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfPageEventHelper;
import com.itextpdf.text.pdf.PdfWriter;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaxFillingServiceImpl implements TaxFillingService {

	private final TaxCalculationRepository taxCalculationRepository;
	private final TaxFillingRepository taxFillingRepository;
	private final UserRepository userRepository;
	private final TaxPaymentRepository taxPaymentRepository;
	private final IncomeService incomeService;
	private final DeductionService deductionService;
	private static final Logger logger = LoggerFactory.getLogger(TaxFillingServiceImpl.class);

	/**
	 * Checks if a Tax Calculation exists for the given user and tax year.
	 * 
	 * @param userId  The ID of the user.
	 * @param taxYear The tax year.
	 * @return true if a Tax Calculation exists, false otherwise.
	 */
	@Override
	public boolean checkIfTaxCalculationExists(Long userId, Year taxYear) {
		return taxCalculationRepository.findByUserUserIdAndTaxYear(userId, taxYear).isPresent();
	}

	/**
	 * Checks if a PDF has been generated for the given user and tax year.
	 * 
	 * @param userId  The ID of the user.
	 * @param taxYear The tax year.
	 * @return true if the PDF has been generated, false otherwise.
	 */
	@Override
	public boolean isPdfGenerated(Long userId, Year taxYear) {
		return taxFillingRepository.isPdfGeneratedForUserAndYear(userId, taxYear);
	}

	/**
	 * Submits the tax return for the given user and tax year.
	 * 
	 * @param userId  The ID of the user.
	 * @param taxYear The tax year.
	 * @return A message indicating the result of the tax return submission.
	 * @throws ResourceNotFoundException If the tax filing PDF has not been
	 *                                   generated.
	 */
	@Override
	public String submitTaxReturn(Long userId, Year taxYear) {
		// Check if PDF is already generated for this user and tax year
		if (!isPdfGenerated(userId, taxYear)) {
			throw new ResourceNotFoundException("Tax filing PDF must be generated before submitting the tax return.");
		}

		// Retrieve the tax filing from the database and check its filing status
		TaxFilling taxFilling = taxFillingRepository.findByUserUserIdAndTaxYear(userId, taxYear).orElseThrow(
				() -> new ResourceNotFoundException("Tax Filing not found for the given user and tax year."));

		// If the return is already filed, return an appropriate message
		if ("Filled".equals(taxFilling.getFillingStatus())) {
			return "Tax return already Filed";
		}

		// Set filing as "Filled" and update the filing date
		taxFilling.setFillingStatus("Filled");
		taxFilling.setFilingDate(LocalDate.now());

		// Retrieve the tax calculation and check the tax liability
		Optional<TaxCalculation> taxCalculationOptional = taxCalculationRepository.findByUserUserIdAndTaxYear(userId,
				taxYear);
		if (taxCalculationOptional.isPresent()) {
			TaxCalculation taxCalculation = taxCalculationOptional.get();

			// If there's a non-zero tax liability, create and save a tax payment entry
			if (taxCalculation.getTaxLiability().compareTo(BigDecimal.ZERO) != 0) {
				TaxPayment taxPayment = TaxPayment.builder()
						.user(userRepository.findById(userId)
								.orElseThrow(() -> new RuntimeException("User not found with ID: " + userId)))
						.amountPaid(taxCalculation.getTaxLiability()).paymentStatus("Pending").build();
				taxPaymentRepository.save(taxPayment);
			}
		}

		// Save the updated tax filing status
		taxFillingRepository.save(taxFilling);
		return "Tax return successfully filed.";
	}

	/**
	 * Retrieves the tax filing status for the given user and tax year.
	 * 
	 * @param userId  The ID of the user.
	 * @param taxYear The tax year.
	 * @return The tax filing status.
	 * @throws ResourceNotFoundException If the tax filing is not found.
	 */
	@Override
	public String getFillingStatus(Long userId, Year taxYear) {
		// Retrieve the filing status for the given user and tax year
		TaxFilling taxFilling = taxFillingRepository.findByUserUserIdAndTaxYear(userId, taxYear).orElseThrow(
				() -> new ResourceNotFoundException("Tax Filing not found for the given user and tax year."));
		return taxFilling.getFillingStatus();
	}

	/**
	 * Retrieves the tax filing history for the given user.
	 * 
	 * @param userId The ID of the user.
	 * @return A list of tax filings.
	 * @throws ResourceNotFoundException If no tax filings are found.
	 */
	@Override
	public List<TaxFilling> getTaxFillingHistory(Long userId) {
		// Retrieve the tax filing history for the given user
		List<TaxFilling> taxFillings = taxFillingRepository.findAllByUserUserId(userId);
		if (taxFillings.isEmpty()) {
			throw new ResourceNotFoundException("No Tax Fillings Found for User");
		}
		return taxFillings;
	}

	/**
	 * Generates a tax filing PDF for the given tax filing details.
	 * 
	 * @param taxFillingDTO The tax filing details.
	 * @return The generated PDF as a byte array.
	 * @throws IOException                    If an error occurs while generating
	 *                                        the PDF.
	 * @throws DocumentException              If an error occurs while handling the
	 *                                        PDF document.
	 * @throws ResourceNotFoundException      If tax calculation is not completed
	 *                                        before filing.
	 * @throws ResourceAlreadyExistsException If the tax filing already exists.
	 */
	@Override
	public byte[] generateTaxFillingPdf(TaxFillingDTO taxFillingDTO) throws IOException, DocumentException {
		// Step 1: Validate Tax Calculation existence
		if (!checkIfTaxCalculationExists(taxFillingDTO.getUserId(), taxFillingDTO.getTaxYear())) {
			throw new ResourceNotFoundException("Please complete the tax calculation before filing the tax return.");
		}

		// Step 2: Check if PDF already exists for the user and tax year
		if (isPdfGenerated(taxFillingDTO.getUserId(), taxFillingDTO.getTaxYear())) {
			throw new ResourceAlreadyExistsException("Tax filing already exists for the given year.");
		}

		// Step 3: Validate the incoming DTO to ensure necessary fields are provided
		validateTaxFillingDTO(taxFillingDTO);

		// Step 4: Fetch Income and Deduction Details from the services
		List<Income> incomes = incomeService.getIncomesByYearAndUserId(taxFillingDTO.getUserId(), Year.now().getValue(),
				0);
		List<Deduction> deductions = deductionService.getDeductionsByYearAndUserId(taxFillingDTO.getUserId(),
				Year.now().getValue(), 0);

		// Step 5: Initialize PDF document
		try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
			Document document = new Document(PageSize.A4);
			PdfWriter writer = PdfWriter.getInstance(document, outputStream);
			document.open();

			// Step 6: Add Logo at Top-Left
			addLogoToPdf(document);

			// Step 7: Add Watermark Logo
			addWatermarkLogo(writer);

			// Step 8: Add Title and Sections
			addBoxedSection1(document, "ITR", 14);
			addBoxedSection1(document, "Certificate under Section 203 of the Income-tax Act, 1961", 12);
			addBoxedSection2(document, "Created Date: " + LocalDate.now(), 10);

			// Step 9: Employer & Employee Details Table
			addDetailsTable(document, taxFillingDTO);

			// Step 10: Add Income Details Section
			addIncomeSection(document, incomes);

			// Step 11: Add Deduction Details Section
			addDeductionsSection(document, deductions);

			// Step 12: Add Taxable Income Section
			addTaxableIncomeSection(document, taxFillingDTO);

			// Step 13: Add Tax Liability Section
			addTaxLiabilitySection(document, taxFillingDTO);

			// Step 14: Add Terms & Conditions at the bottom
			addTermsAndConditions(writer);

			// Step 15: Add Footer
			addFooter(writer);

			// Step 16: Save Tax Filing in the database
			saveTaxFiling(taxFillingDTO);

			// Close the document and return PDF byte array
			document.close();
			return outputStream.toByteArray();
		}
	}

	/**
	 * Creates a tax filing PDF for the given tax filing details.
	 * 
	 * @param taxFillingDTO The tax filing details.
	 * @return The generated PDF as a byte array.
	 * @throws IOException       If an error occurs while generating the PDF.
	 * @throws DocumentException If an error occurs while handling the PDF document.
	 */
	@Override
	public byte[] createTaxFillingPdf(TaxFillingDTO taxFillingDTO) throws IOException, DocumentException {

		// Fetch Incomes and Deductions from the respective services
		List<Income> incomes = incomeService.getIncomesByYearAndUserId(taxFillingDTO.getUserId(), Year.now().getValue(),
				0);
		List<Deduction> deductions = deductionService.getDeductionsByYearAndUserId(taxFillingDTO.getUserId(),
				Year.now().getValue(), 0);

		try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
			// Initialize the PDF document
			Document document = new Document(PageSize.A4);
			PdfWriter writer = PdfWriter.getInstance(document, outputStream);
			document.open();

			// Add Logo to the document with error handling for missing file
			addLogoToPdf(document);

			// Add Watermark with opacity
			addWatermarkLogo(writer);

			// Add Sections and Tables
			addBoxedSection1(document, "ITR", 14); // Title Section
			addBoxedSection1(document, "Certificate under Section 203 of the Income-tax Act, 1961", 12); // Act Line
			addBoxedSection2(document, "Created Date: " + LocalDate.now(), 10); // Created Date Section

			// user & User Details Table
			addDetailsTable(document, taxFillingDTO);

			// Income Section with Calculation and Total Income
			addIncomeSection(document, incomes);

			// Deductions Section with Calculation and Total Deductions
			addDeductionsSection(document, deductions);

			// Taxable Income Section
			// Step 12: Add Taxable Income Section
			addTaxableIncomeSection(document, taxFillingDTO);

			// Step 13: Add Tax Liability Section
			addTaxLiabilitySection(document, taxFillingDTO);

			// Step 14: Add Terms & Conditions at the bottom
			addTermsAndConditions(writer);

			// Step 15: Add Footer
			addFooter(writer);

			// Close the document and return the generated PDF
			document.close();
			return outputStream.toByteArray();
		}
	}

	/**
	 * Helper Method Validates the required fields in the TaxFillingDTO before
	 * submission.
	 *
	 * @param taxFillingDTO The tax filing data transfer object to validate.
	 * @throws ResourceNotFoundException If required fields are missing.
	 */
	private void validateTaxFillingDTO(TaxFillingDTO taxFillingDTO) {
		if (Objects.isNull(taxFillingDTO.getUserId()) || Objects.isNull(taxFillingDTO.getTaxYear())) {
			throw new ResourceNotFoundException("User ID and Tax Year are required fields.");
		}
		if (Objects.isNull(taxFillingDTO.getGrossIncome()) || Objects.isNull(taxFillingDTO.getTotalDeductions())) {
			throw new ResourceNotFoundException("Gross Income and Total Deductions are required.");
		}
	}

	/**
	 * Helper Method Adds a company logo to the PDF document.
	 *
	 * @param document The PDF document to which the logo will be added.
	 * @throws BadElementException If there is an issue with the logo image.
	 * @throws IOException         If the logo file cannot be found or loaded.
	 */
	private void addLogoToPdf(Document document) throws BadElementException, IOException {
		String logoPath = "src/main/resources/static/img/pageLogo.png";
		try {
			Image logo = Image.getInstance(logoPath);
			logo.scaleToFit(120, 120); // Increased size
			logo.setAlignment(Element.ALIGN_LEFT);
			document.add(logo);
		} catch (Exception e) {
			logger.error("Error adding logo to the PDF: {}", e.getMessage(), e);
		}
	}

	/**
	 * Helper Method Adds a watermark logo to the PDF document.
	 *
	 * @param writer The PdfWriter instance used to modify the document.
	 * @throws IOException       If the watermark logo cannot be loaded.
	 * @throws DocumentException If an error occurs while processing the watermark.
	 */
	private void addWatermarkLogo(PdfWriter writer) throws IOException, DocumentException {
		PdfContentByte canvas = writer.getDirectContentUnder();
		String logoPath = "src/main/resources/static/img/pageLogo.png";
		Image watermarkLogo = Image.getInstance(logoPath);
		watermarkLogo.scaleToFit(400, 400);
		watermarkLogo.setAbsolutePosition(100, 220);

		// Set opacity using PdfGState (transparency effect)
		PdfGState gstate = new PdfGState();
		gstate.setFillOpacity(0.2f);
		canvas.setGState(gstate);
		canvas.addImage(watermarkLogo);
	}

	/**
	 * Helper Method Adds a table displaying user details to the PDF document.
	 *
	 * @param document      The PDF document to which the table will be added.
	 * @param taxFillingDTO The tax filing details containing user information.
	 * @throws DocumentException If an error occurs while creating the table.
	 */
	private void addDetailsTable(Document document, TaxFillingDTO taxFillingDTO) throws DocumentException {
		PdfPTable detailsTable = new PdfPTable(3);
		detailsTable.setWidthPercentage(100);
		detailsTable.setWidths(new float[] { 1, 1, 1 });
		addTableRow(detailsTable, "Employee Name", "Employee PAN", "TAX Year");
		addTableRow(detailsTable, taxFillingDTO.getUserName(), taxFillingDTO.getGovernmentId(),
				taxFillingDTO.getTaxYear().toString());
		document.add(detailsTable);
	}

	/**
	 * Helper Method Adds the income details section to the PDF document.
	 *
	 * @param document The PDF document to which the income details will be added.
	 * @param incomes  A list of income records to include in the section.
	 * @throws DocumentException If an error occurs while creating the table.
	 */
	private void addIncomeSection(Document document, List<Income> incomes) throws DocumentException {
		addBoxedSection(document, "Section A: Income Details", 12);
		PdfPTable incomeTable = new PdfPTable(2);
		incomeTable.setWidthPercentage(100);
		incomeTable.setWidths(new float[] { 1, 2 });

		BigDecimal totalIncome = BigDecimal.ZERO;
		for (Income income : incomes) {
			addTableRow(incomeTable, income.getIncomeSource(), income.getAmount().toString());
			totalIncome = totalIncome.add(income.getAmount());
		}
		addTableRow(incomeTable, "Gross Income:", totalIncome.toString()); // Final Row with Total
		document.add(incomeTable);
	}

	/**
	 * Helper Method Adds the deductions section to the PDF document.
	 *
	 * @param document   The PDF document to which the deductions will be added.
	 * @param deductions A list of deductions to include in the section.
	 * @throws DocumentException If an error occurs while creating the table.
	 */
	private void addDeductionsSection(Document document, List<Deduction> deductions) throws DocumentException {
		addBoxedSection(document, "Section B: Deductions", 12);
		PdfPTable deductionsTable = new PdfPTable(2);
		deductionsTable.setWidthPercentage(100);
		deductionsTable.setWidths(new float[] { 1, 2 });

		BigDecimal totalDeductions = BigDecimal.ZERO;
		for (Deduction deduction : deductions) {
			addTableRow(deductionsTable, deduction.getDeductionType(), deduction.getAmount().toString());
			totalDeductions = totalDeductions.add(deduction.getAmount());
		}
		addTableRow(deductionsTable, "Total Deductions:", totalDeductions.toString()); // Final Row with Total
		document.add(deductionsTable);
	}

	/**
	 * Helper Method Adds the taxable income section to the PDF document.
	 *
	 * @param document      The PDF document to which the taxable income section
	 *                      will be added.
	 * @param taxFillingDTO The tax filing details containing taxable income.
	 * @throws DocumentException If an error occurs while creating the table.
	 */
	private void addTaxableIncomeSection(Document document, TaxFillingDTO taxFillingDTO) throws DocumentException {
		addBoxedSection(document, "Section C: Taxable Income {A-B}", 12);
		PdfPTable taxableIncomeTable = new PdfPTable(2);
		taxableIncomeTable.setWidthPercentage(100);
		taxableIncomeTable.setWidths(new float[] { 1, 2 });
		addTableRow(taxableIncomeTable, "Taxable Income:", taxFillingDTO.getTaxableIncome().toString());
		document.add(taxableIncomeTable);
	}

	/**
	 * Helper Method Adds the tax liability section to the PDF document.
	 *
	 * @param document      The PDF document to which the tax liability section will
	 *                      be added.
	 * @param taxFillingDTO The tax filing details containing tax liability.
	 * @throws DocumentException If an error occurs while creating the table.
	 */
	private void addTaxLiabilitySection(Document document, TaxFillingDTO taxFillingDTO) throws DocumentException {
		addBoxedSection(document, "Section D: Tax Liability", 12);
		PdfPTable taxLiabilityTable = new PdfPTable(2);
		taxLiabilityTable.setWidthPercentage(100);
		taxLiabilityTable.setWidths(new float[] { 1, 2 });
		addTableRow(taxLiabilityTable, "Tax Liability:", taxFillingDTO.getTaxLiabillity().toString());
		document.add(taxLiabilityTable);
	}

	/**
	 * Helper Method Adds the terms and conditions section to the PDF document.
	 *
	 * @param writer The PdfWriter instance used to modify the document.
	 * @throws DocumentException If an error occurs while adding the section.
	 */
	private void addTermsAndConditions(PdfWriter writer) throws DocumentException {
		PdfPTable termsTable = new PdfPTable(1);
		termsTable.setWidthPercentage(100);

		// Add Title
		PdfPCell termsCell = new PdfPCell();
		termsCell.setPadding(10);
		termsCell.setBorder(Rectangle.BOX);
		termsCell.setPhrase(new Phrase("Terms and Conditions", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
		termsCell.setHorizontalAlignment(Element.ALIGN_CENTER);
		termsTable.addCell(termsCell);

		// Add Content
		PdfPCell termsContentCell = new PdfPCell(new Phrase("""
				1. Tax returns should be filed before the due date to avoid penalties.
				2. Any excess tax paid will be refunded as per IT Act guidelines.
				3. It is the taxpayer’s responsibility to provide accurate details.
				4. Late filing may attract interest under Section 234A, 234B, and 234C.
				5. TDS deducted should match with Form 26AS for validation.
				6. The taxpayer must retain this certificate for future reference.
				7. Tax authorities may demand additional documents for verification.""",
				FontFactory.getFont(FontFactory.HELVETICA, 10)));
		termsContentCell.setBorder(Rectangle.BOX);
		termsContentCell.setPadding(8);
		termsTable.addCell(termsContentCell);

		// Add Terms & Conditions content to the bottom
		PdfContentByte termsCanvas = writer.getDirectContent();
		ColumnText column = new ColumnText(termsCanvas);
		column.setSimpleColumn(new Rectangle(36, 10, PageSize.A4.getWidth() - 36, 180)); // Adjust Y-coordinates
		column.addElement(termsTable);
		column.go();
	}

	/**
	 * Helper Method Saves tax filing information for a user. Validates the user ID,
	 * sets the filing date, tax year, and refund status. Marks the PDF as generated
	 * and saves the tax filing record.
	 *
	 * @param taxFillingDTO The tax filing data transfer object containing
	 *                      tax-related details.
	 */
	private void saveTaxFiling(TaxFillingDTO taxFillingDTO) {
		User user = userRepository.findById(taxFillingDTO.getUserId())
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		TaxFilling taxFilling = TaxFilling.builder().user(user).filingDate(LocalDate.now())
				.taxYear(taxFillingDTO.getTaxYear()).refundStatus(taxFillingDTO.getRefundStatus()).pdfGenerated(true)
				.build();

		taxFillingRepository.save(taxFilling);
	}

	/**
	 * Helper Method Adds a boxed section with centered alignment to the document.
	 *
	 * @param document The PDF document where the section will be added.
	 * @param text     The section title.
	 * @param fontSize The font size for the section title.
	 * @throws DocumentException If there is an issue adding content to the
	 *                           document.
	 */
	private void addBoxedSection1(Document document, String text, int fontSize) throws DocumentException {
		PdfPTable table = new PdfPTable(1);
		table.setWidthPercentage(100);
		PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, fontSize)));
		cell.setHorizontalAlignment(Element.ALIGN_CENTER);
		cell.setBorder(Rectangle.BOX);
		cell.setPadding(8);
		table.addCell(cell);
		document.add(table);
	}

	/**
	 * Helper Method Adds a boxed section with right-aligned text to the document.
	 *
	 * @param document The PDF document where the section will be added.
	 * @param text     The section title.
	 * @param fontSize The font size for the section title.
	 * @throws DocumentException If there is an issue adding content to the
	 *                           document.
	 */
	private void addBoxedSection2(Document document, String text, int fontSize) throws DocumentException {
		PdfPTable table = new PdfPTable(1);
		table.setWidthPercentage(100);
		PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, fontSize)));
		cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
		cell.setBorder(Rectangle.BOX);
		cell.setPadding(8);
		table.addCell(cell);
		document.add(table);
	}

	/**
	 * Helper Method Adds a boxed section with left-aligned text to the document.
	 *
	 * @param document The PDF document where the section will be added.
	 * @param text     The section title.
	 * @param fontSize The font size for the section title.
	 * @throws DocumentException If there is an issue adding content to the
	 *                           document.
	 */
	private void addBoxedSection(Document document, String text, int fontSize) throws DocumentException {
		PdfPTable table = new PdfPTable(1);
		table.setWidthPercentage(100);
		PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, fontSize)));
		cell.setHorizontalAlignment(Element.ALIGN_LEFT);
		cell.setBorder(Rectangle.BOX);
		cell.setPadding(8);
		table.addCell(cell);
		document.add(table);
	}

	/**
	 * Helper Method Adds a row with two columns to a PDF table.
	 *
	 * @param table The table where the row will be added.
	 * @param label The label for the row.
	 * @param value The corresponding value.
	 */
	private void addTableRow(PdfPTable table, String label, String value) {
		PdfPCell cell1 = new PdfPCell(new Phrase(label, FontFactory.getFont(FontFactory.HELVETICA, 10)));
		cell1.setBackgroundColor(BaseColor.WHITE); // Ensure white background
		cell1.setPadding(5);
		table.addCell(cell1);

		PdfPCell cell2 = new PdfPCell(new Phrase(value, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
		cell2.setPadding(5);
		table.addCell(cell2);
	}

	/**
	 * Helper Method Adds a row with three columns to a PDF table.
	 *
	 * @param table  The table where the row will be added.
	 * @param value1 The value for the first column.
	 * @param value2 The value for the second column.
	 * @param value3 The value for the third column.
	 */
	private void addTableRow(PdfPTable table, String value1, String value2, String value3) {
		PdfPCell cell1 = new PdfPCell(new Phrase(value1, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
		cell1.setBackgroundColor(BaseColor.WHITE);
		cell1.setPadding(20);
		cell1.setHorizontalAlignment(Element.ALIGN_CENTER);
		cell1.setVerticalAlignment(Element.ALIGN_CENTER);
		table.addCell(cell1);

		PdfPCell cell2 = new PdfPCell(new Phrase(value2, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
		cell2.setBackgroundColor(BaseColor.WHITE);
		cell2.setPadding(20);
		cell2.setHorizontalAlignment(Element.ALIGN_CENTER);
		cell2.setVerticalAlignment(Element.ALIGN_CENTER);
		table.addCell(cell2);

		PdfPCell cell3 = new PdfPCell(new Phrase(value3, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
		cell3.setBackgroundColor(BaseColor.WHITE);
		cell3.setPadding(20);
		cell3.setHorizontalAlignment(Element.ALIGN_CENTER);
		cell3.setVerticalAlignment(Element.ALIGN_CENTER);
		table.addCell(cell3);
	}

	/**
	 * Helper Method Adds a footer to each page of the PDF document. The footer
	 * contains the tax department’s website and contact details.
	 *
	 * @param writer The PdfWriter used to write content to the document.
	 */
	private void addFooter(PdfWriter writer) {
		writer.setPageEvent(new PdfPageEventHelper() {
			@Override
			public void onEndPage(PdfWriter writer, Document document) {
				Rectangle page = document.getPageSize();
				float x = (page.getLeft(20) + page.getRight(20)) / 2;
				float y = page.getBottom(20);
				Phrase footerText = new Phrase("Tax Department | www.cleartax.gov | Contact: support@cleartax.gov",
						FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8));
				ColumnText.showTextAligned(writer.getDirectContent(), Element.ALIGN_CENTER, footerText, x, y, 0);
			}
		});
	}

}
