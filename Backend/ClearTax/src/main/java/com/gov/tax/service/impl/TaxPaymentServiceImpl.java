package com.gov.tax.service.impl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import com.gov.tax.dto.UserDTO;
import com.gov.tax.entity.Deduction;
import com.gov.tax.entity.Income;
import com.gov.tax.entity.TaxCalculation;
import com.gov.tax.entity.TaxPayment;
import com.gov.tax.exception.ResourceNotFoundException;
import com.gov.tax.mapper.UserMapper;
import com.gov.tax.repository.TaxCalculationRepository;
import com.gov.tax.repository.TaxPaymentRepository;
import com.gov.tax.service.DeductionService;
import com.gov.tax.service.IncomeService;
import com.gov.tax.service.TaxPaymentService;
import com.gov.tax.service.UserService;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.Image;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.ColumnText;
import com.itextpdf.text.pdf.PdfContentByte;
import com.itextpdf.text.pdf.PdfGState;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfPageEventHelper;
import com.itextpdf.text.pdf.PdfWriter;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaxPaymentServiceImpl implements TaxPaymentService {

	private static final String NO_DATA_FOUND = "No data found..!";
	private static final String PENDDING = "Pending";
	private static final String GROSS_INCOME = "Gross Income: ";
	private static final String TOTAL_DEDUCTIONS = "Total Deductions: ";
	private static final String TAXABLE_INCOME = "Taxable Income: ";
	private static final String TOTAL_TAX = "Tax Liability: ";
	private static final Logger logger = LoggerFactory.getLogger(TaxPaymentServiceImpl.class);

	private static final Random RANDOM = new Random();

	@Value("${razorpay.api.key}")
	private String apiKey;

	@Value("${razorpay.api.secret}")
	private String apiSecret;

	private final TaxPaymentRepository taxPaymentRepository;
	private final UserService userService;
	private final UserMapper userMapper;
	private final IncomeService incomeService;
	private final DeductionService deductionService;

	@Lazy
	private final TaxCalculationRepository taxCalculationRepository;

	/**
	 * Fetches the first tax payment with "Pending" status for a given user ID. If
	 * no such payment exists, throws a ResourceNotFoundException.
	 *
	 * @param userId The ID of the user whose tax payment is to be fetched.
	 * @return The first tax payment with "Pending" status.
	 * @throws ResourceNotFoundException If no tax payment is found.
	 */
	@Override
	public TaxPayment getTaxPaymentByUserId(Long userId) {
		List<TaxPayment> taxPayments = taxPaymentRepository.findAllByUserUserId(userId);

		if (taxPayments.isEmpty()) {
			throw new ResourceNotFoundException(NO_DATA_FOUND);
		}

		// Search for the first PENDDING payment
		for (TaxPayment taxPayment : taxPayments) {
			if (PENDDING.equals(taxPayment.getPaymentStatus())) {
				return taxPayment;
			}
		}

		throw new ResourceNotFoundException("No Tax Payments found with NULL transactionId!");
	}

	/**
	 * Fetches a specific tax payment based on the user ID and transaction ID.
	 *
	 * @param userId        The ID of the user whose tax payment is to be fetched.
	 * @param transactionId The transaction ID of the tax payment.
	 * @return The tax payment matching the given user ID and transaction ID.
	 * @throws ResourceNotFoundException If no tax payment is found.
	 */
	@Override
	public TaxPayment getTaxPaymentByUserIdAndTransactionId(Long userId, String transactionId) {
		TaxPayment taxPayment = taxPaymentRepository.findByUserUserIdAndTransactionId(userId, transactionId);

		if (taxPayment == null) {
			throw new ResourceNotFoundException(NO_DATA_FOUND);
		}

		return taxPayment;
	}

	/**
	 * Initiates a tax payment through Razorpay for the specified user. If
	 * successful, updates the tax payment with a "Pending" status.
	 *
	 * @param userId    The ID of the user making the tax payment.
	 * @param isAmended Indicates whether the tax payment is for an amendment (1) or
	 *                  not (0).
	 * @return The tax payment with the updated status.
	 * @throws ResourceNotFoundException If no tax payment record is found.
	 * @throws RazorpayException         If an error occurs while creating the
	 *                                   Razorpay order.
	 */
	@Override
	public TaxPayment payTaxAtRazorpay(Long userId, int isAmended) throws RazorpayException {
		List<TaxPayment> taxPayments = taxPaymentRepository.findAllByUserUserId(userId);
		TaxCalculation taxCalculation = taxCalculationRepository
				.findByUserUserIdAndTaxYearAndIsAmended(userId, Year.now(), isAmended)
				.orElseThrow(() -> new ResourceNotFoundException("No tax calculation found for user ID: " + userId));

		TaxPayment taxPayment = taxPayments.stream().filter(tp -> PENDDING.equals(tp.getPaymentStatus())).findFirst()
				.orElseThrow(() -> new ResourceNotFoundException(NO_DATA_FOUND));

		RazorpayClient razorpayClient = new RazorpayClient(apiKey, apiSecret);
		JSONObject orderRequest = new JSONObject();
		orderRequest.put("amount", taxPayment.getAmountPaid().multiply(BigDecimal.valueOf(100)));
		orderRequest.put("currency", "INR");
		orderRequest.put("receipt", "TXN-" + LocalDateTime.now().toString());

		Order order = razorpayClient.orders.create(orderRequest);
		if (order != null) {
			taxPayment.setPaymentStatus(PENDDING);
			taxPayment.setTransactionId(order.get("id").toString());
			taxPayment.setTaxCalculation(taxCalculation);
			taxPaymentRepository.save(taxPayment);
			return taxPayment;
		} else {
			throw new RazorpayException("Error in creating Razorpay order... Payment Failed");
		}
	}

	/**
	 * Verifies the payment signature sent by Razorpay. If valid, updates the
	 * payment status to "Completed".
	 *
	 * @param orderId           The order ID generated by Razorpay.
	 * @param paymentId         The payment ID received from Razorpay.
	 * @param razorpaySignature The signature received from Razorpay for
	 *                          verification.
	 * @return "success" if the payment is verified, otherwise "failure".
	 * @throws RazorpayException If payment verification fails.
	 */
	@Override
	public String verifyPayment(String orderId, String paymentId, String razorpaySignature) throws RazorpayException {
		String payload = orderId + '|' + paymentId;
		boolean isValid = Utils.verifySignature(payload, razorpaySignature, apiSecret);

		if (isValid) {
			TaxPayment taxPayment = taxPaymentRepository.findByTransactionId(orderId);
			if (taxPayment != null) {
				taxPayment.setPaymentStatus("Completed");
				taxPayment.setTransactionId(generateTransactionId());
				taxPayment.setPaymentDate(LocalDate.now());
				taxPaymentRepository.save(taxPayment);
				return "success";
			}
		} else {
			throw new RazorpayException("Payment verification failed");
		}
		return "failure";
	}

	/**
	 * Fetches all "Completed" tax payments for a given user ID.
	 *
	 * @param userId The ID of the user whose tax payments are to be fetched.
	 * @return A list of completed tax payments.
	 * @throws ResourceNotFoundException If no completed tax payments are found.
	 */
	@Override
	public List<TaxPayment> getAllTaxPaymentByUserId(Long userId) {
		List<TaxPayment> taxPayments = taxPaymentRepository.findAllByUserUserId(userId);

		if (taxPayments.isEmpty()) {
			throw new ResourceNotFoundException(NO_DATA_FOUND);
		}

		List<TaxPayment> completedPayments = taxPayments.stream()
				.filter(tp -> "Completed".equals(tp.getPaymentStatus())).toList();

		if (completedPayments.isEmpty()) {
			throw new ResourceNotFoundException("No Tax Payments found without NULL transactionId!");
		}

		return completedPayments;
	}

	/**
	 * Creates a new tax payment record for a user with the specified amount. The
	 * initial payment status is set to "Pending".
	 *
	 * @param userId The ID of the user for whom the tax payment is created.
	 * @param amount The amount of tax to be paid.
	 */
	@Override
	public void createPayment(Long userId, BigDecimal amount) {
		TaxPayment taxPayment = TaxPayment.builder().user(userMapper.toEntity(userService.getUserById(userId)))
				.amountPaid(amount).paymentStatus(PENDDING).paymentDate(null).transactionId(null).build();

		taxPaymentRepository.save(taxPayment); // Save the new tax payment record
	}

	/**
	 * Generates and downloads a tax payment receipt as a PDF.
	 *
	 * @param userId        The ID of the user requesting the receipt.
	 * @param transactionId The transaction ID for which the receipt is generated.
	 * @return A byte array representing the PDF receipt.
	 * @throws IOException       If an error occurs while generating the PDF.
	 * @throws DocumentException If an error occurs while processing the PDF
	 *                           document.
	 */
	@Override
	public byte[] downloadReceipt(Long userId, String transactionId) throws IOException, DocumentException {
		// Fetch user and tax payment details
		UserDTO user = userService.getUserById(userId);
		TaxPayment taxPayment = getTaxPaymentByUserIdAndTransactionId(userId, transactionId);
		TaxCalculation taxCalculation = taxPayment.getTaxCalculation();

		try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
			// Initialize document and writer
			Document document = new Document(PageSize.A4);
			PdfWriter writer = PdfWriter.getInstance(document, outputStream);
			document.open();

			// Add logo to the PDF (try to load the logo with error handling)
			addLogoToPDF(document);

			// Add header and user/tax details to the PDF
			addTitle(document, "Tax Payment Receipt");
			addUserAndTaxDetails(document, user, taxCalculation, taxPayment);

			String content = """
					1. The payment receipt is valid only after confirmation of payment.
					2. Tax payments are non-refundable.
					3. The information in this receipt is confidential and cannot be disclosed without prior consent.
					4. Please keep this receipt for your records.
					5. For further assistance, contact the tax department.
					""";

			// Add terms and conditions
			addTermsAndConditions(document, content);

			// Add footer
			addFooter(writer);

			document.close();
			return outputStream.toByteArray();
		}
	}

	/**
	 * Generates a tax summary report for a user, including income, deductions, tax
	 * liabilities, and payment details.
	 *
	 * @param userId The ID of the user for whom the tax summary report is
	 *               generated.
	 * @return A byte array representing the PDF tax summary report.
	 * @throws DocumentException If an error occurs while processing the PDF
	 *                           document.
	 * @throws IOException       If an error occurs while generating the PDF.
	 */
	public byte[] createTaxSummaryReport(Long userId) throws DocumentException, java.io.IOException {
		// Fetch the data required for the report
		List<Income> incomes = incomeService.getIncomesByYearAndUserId(userId, Year.now().getValue(), 0);
		List<Deduction> deductions = deductionService.getDeductionsByYearAndUserId(userId, Year.now().getValue(), 0);
		UserDTO userDTO = userService.getUserById(userId);

		TaxCalculation taxCalculation = taxCalculationRepository.findByUserUserId(userId)
				.orElseThrow(() -> new ResourceNotFoundException("No tax calculations found for user ID: " + userId))
				.stream().filter(tc -> tc.getTaxYear().equals(Year.now()) && tc.getIsAmended() == 0).findFirst()
				.orElse(null);

		List<TaxPayment> payment = getAllTaxPaymentByUserId(userId);

		try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
			// Create a new document in landscape mode (rotated letter size)
			Document document = new Document(PageSize.LETTER.rotate());
			PdfWriter writer = PdfWriter.getInstance(document, outputStream);

			document.open();
			// Add sections to the document
			addLogoToPDF(document);
			addTitle(document);
			addWatermarkLogo(writer);
			addUserDetails(document, userDTO, taxCalculation);
			addIncomeDetails(document, incomes, taxCalculation);
			addDeductionDetails(document, deductions, taxCalculation);
			addTaxableIncome(document, taxCalculation);
			addTaxLiability(document, taxCalculation);
			addPaymentDetails(document, payment);
			String content = """
					1. Tax returns must be filed by the due date to avoid penalties.
					2. Excess tax paid will be refunded as per Income Tax Act guidelines.
					3. It is the taxpayer's responsibility to provide accurate details.
					4. Late filing may attract interest under Sections 234A, 234B, and 234C.
					5. TDS deducted should match with Form 26AS for validation.
					6. The taxpayer must retain this certificate for future reference.
					7. Tax authorities may demand additional documents for verification.
					""";
			addTermsAndConditions(document, content);
			addFooter(writer);

			document.close();
			return outputStream.toByteArray();
		}
	}

	/**
	 * Generates a tax transcript for a user, including tax calculations, amendment
	 * details, and payment history.
	 *
	 * @param userId The ID of the user for whom the tax transcript is generated.
	 * @return A byte array representing the PDF tax transcript.
	 * @throws IOException       If an error occurs while generating the PDF.
	 * @throws DocumentException If an error occurs while processing the PDF
	 *                           document.
	 */
	@Override
	public byte[] generateTaxTranscript(Long userId) throws IOException, DocumentException {
		// Fetching necessary data from services for the user
		List<Income> incomes = incomeService.getIncomesByYearAndUserId(userId, Year.now().getValue(), 0);
		List<Deduction> deductions = deductionService.getDeductionsByYearAndUserId(userId, Year.now().getValue(), 0);
		List<Income> amendmentIncomes = new ArrayList<>();
		List<Deduction> amendmentDeductions = new ArrayList<>();

		UserDTO userDTO = userService.getUserById(userId);
		List<TaxCalculation> taxCalculations = taxCalculationRepository.findByUserUserId(userId)
				.orElseThrow(() -> new ResourceNotFoundException("No tax calculations found for user ID: " + userId));

		// Fetch the tax calculation for the current year and non-amended
		Optional<TaxCalculation> taxCalculationOptional = taxCalculations.stream().filter(
				taxCalculation -> taxCalculation.getTaxYear().equals(Year.now()) && taxCalculation.getIsAmended() == 0)
				.findFirst();
		TaxCalculation taxCalculation = taxCalculationOptional.orElse(null);

		// Fetch the amendment tax calculation if any
		Optional<TaxCalculation> amendmentTaxCalculationOptional = taxCalculations.stream()
				.filter(taxCalculation1 -> taxCalculation1.getTaxYear().equals(Year.now())
						&& taxCalculation1.getIsAmended() == 1)
				.findFirst();
		TaxCalculation amendmentTaxCalculation = amendmentTaxCalculationOptional.orElse(null);

		if (amendmentTaxCalculation != null) {
			amendmentIncomes = incomeService.getIncomesByYearAndUserId(userId, Year.now().getValue(), 1);
			amendmentDeductions = deductionService.getDeductionsByYearAndUserId(userId, Year.now().getValue(), 1);
		}

		// Fetch filing and payment history
		List<TaxPayment> taxPayments = getAllTaxPaymentByUserId(userId);

		// Prepare the PDF output stream
		try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
			Document document = new Document(PageSize.LEDGER);
			PdfWriter writer = PdfWriter.getInstance(document, outputStream);

			document.open();

			// Generate the header section
			generateHeader(document);

			// Generate the personal information section
			generatePersonalInfoTable(document, userDTO, taxCalculation);

			// Generate the income details section
			generateIncomeDetails(document, incomes, taxCalculation);

			// Generate the deductions details section
			generateDeductionDetails(document, deductions, taxCalculation);

			// Generate tax calculation details
			generateTaxCalculation(document, taxCalculation);

			// If there are amendment details, generate them
			if (!amendmentIncomes.isEmpty() && !amendmentDeductions.isEmpty()) {
				generateAmendmentDetails(document, amendmentIncomes, amendmentDeductions, amendmentTaxCalculation);
			}

			// Generate the payment history section
			generatePaymentHistory(document, taxPayments);

			// add terms and conditions
			String content = """
					1. Tax transcripts are available for current and past 9 years.
					2. Different transcript types provide various information.
					3. Requests can be made online, by mail, or phone.
					4. Online requests take 5-10 days, mail requests up to 10 weeks.
					5. IRS ensures security; beware of cybercriminals.
					6. Used for loans, tax issues, and income verification.
					7. May not include amended returns or updates.
					""";
			addTermsAndConditions(document, content);

			// Add footer section
			addFooter(writer);

			// Finalize and return the document as byte array
			document.close();
			return outputStream.toByteArray();
		}
	}

	/**
	 * Generates a random transaction ID using the current timestamp and a random
	 * 6-digit number.
	 *
	 * @return A unique transaction ID in the format
	 *         "TXN-{timestamp}-{randomNumber}".
	 */
	private String generateTransactionId() {
		long timestamp = System.currentTimeMillis(); // Current timestamp in milliseconds
		int randomNum = RANDOM.nextInt(1000000); // Random number between 0 and 999999
		return "TXN-" + timestamp + "-" + String.format("%06d", randomNum); // Format with leading zeros if needed
	}

	/**
	 * Adds the company logo to the PDF document. If the logo fails to load, an
	 * error message is logged.
	 *
	 * @param document The PDF document to which the logo is added.
	 */
	protected void addLogoToPDF(Document document) {
		String logoPath = "src/main/resources/static/img/pageLogo.png";
		try {
			Image logo = Image.getInstance(logoPath);
			logo.scaleToFit(100, 100);
			logo.setAlignment(Element.ALIGN_LEFT);
			document.add(logo);
		} catch (Exception e) {
			logger.error("Error adding logo: {}", e.getMessage(), e);
		}
	}

	/**
	 * Adds a centered title to the PDF document.
	 *
	 * @param document  The PDF document to which the title is added.
	 * @param titleText The text of the title to be displayed.
	 * @throws DocumentException If an error occurs while adding the title to the
	 *                           document.
	 */
	private void addTitle(Document document, String titleText) throws DocumentException {
		Paragraph title = new Paragraph(titleText, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, Font.BOLD));
		title.setAlignment(Element.ALIGN_CENTER);
		document.add(title);
		document.add(Chunk.NEWLINE);
	}

	/**
	 * Adds user and tax-related details to the PDF document.
	 *
	 * @param document       The PDF document where the details will be added.
	 * @param user           The user whose details are being included.
	 * @param taxCalculation The tax calculation details for the user.
	 * @param taxPayment     The tax payment details associated with the user.
	 * @throws DocumentException If an error occurs while adding details to the
	 *                           document.
	 */
	private void addUserAndTaxDetails(Document document, UserDTO user, TaxCalculation taxCalculation,
			TaxPayment taxPayment) throws DocumentException {
		addReceiptDetail(document, "User ID:", String.valueOf(user.getUserId()));
		addReceiptDetail(document, "Name:", user.getName());
		addReceiptDetail(document, "Government ID:", user.getGovernmentId());
		addReceiptDetail(document, "Email:", user.getEmail());
		addReceiptDetail(document, "Tax Year:", taxCalculation.getTaxYear().toString());
		addReceiptDetail(document, GROSS_INCOME, taxCalculation.getGrossIncome().toString());
		addReceiptDetail(document, TOTAL_DEDUCTIONS, taxCalculation.getDeductions().toString());
		addReceiptDetail(document, TAXABLE_INCOME, taxCalculation.getTaxableIncome().toString());
		addReceiptDetail(document, TOTAL_TAX, taxCalculation.getTaxLiability().toString());
		addReceiptDetail(document, "============================", "============================================");
		addReceiptDetail(document, "Amount Paid:", taxPayment.getAmountPaid().toString());
		addReceiptDetail(document, "Transaction ID:", taxPayment.getTransactionId());
		addReceiptDetail(document, "Payment Date:", taxPayment.getPaymentDate().toString());
	}

	/**
	 * Adds terms and conditions to the PDF document.
	 *
	 * @param document The PDF document to which the terms and conditions are added.
	 * @param content  The content of the terms and conditions.
	 * @throws DocumentException If an error occurs while adding the content to the
	 *                           document.
	 */
	private void addTermsAndConditions(Document document, String content) throws DocumentException {
		document.add(Chunk.NEWLINE);
		Paragraph termsTitle = new Paragraph("Terms and Conditions",
				FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14));
		document.add(termsTitle);
		document.add(Chunk.NEWLINE);
		Paragraph termsContent = new Paragraph(content);
		document.add(termsContent);
	}

	/**
	 * Adds a key-value detail to the receipt section of the PDF document.
	 *
	 * @param document The PDF document to which the receipt detail is added.
	 * @param label    The label describing the detail (e.g., "Amount Paid").
	 * @param value    The value corresponding to the label.
	 * @throws DocumentException If an error occurs while adding the details to the
	 *                           document.
	 */
	private void addReceiptDetail(Document document, String label, String value) throws DocumentException {
		PdfPTable table = new PdfPTable(2);
		table.setWidths(new float[] { 2, 3 });
		table.setWidthPercentage(100);

		// lable cell
		PdfPCell labelCell = new PdfPCell(new Phrase(label, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
		labelCell.setBorder(Rectangle.NO_BORDER);
		labelCell.setHorizontalAlignment(Element.ALIGN_LEFT);
		labelCell.setPaddingRight(5);

		// value cell
		PdfPCell valueCell = new PdfPCell(new Phrase(value, FontFactory.getFont(FontFactory.HELVETICA, 12)));
		valueCell.setBorder(Rectangle.NO_BORDER);
		valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT); // Align value to the right

		table.addCell(labelCell);
		table.addCell(valueCell);

		document.add(table);
	}

	/**
	 * Adds the title and introductory sections to the PDF document.
	 *
	 * @param document The PDF document where the title and sections will be added.
	 * @throws DocumentException If an error occurs while adding the sections to the
	 *                           document.
	 */
	protected void addTitle(Document document) throws DocumentException {
		addBoxedSection1(document, "Tax Summary Report", 14);
		addBoxedSection1(document,
				"Report under Section 203 of the Income-tax Act, 1961, detailing tax deducted at source and related particulars.",
				12);
		addBoxedSection2(document, "Created Date: " + LocalDate.now(), 10);
	}

	/**
	 * Adds a boxed section with centered text to the PDF document.
	 *
	 * @param document The PDF document where the section will be added.
	 * @param text     The text content of the section.
	 * @param fontSize The font size of the text.
	 * @throws DocumentException If an error occurs while adding the section.
	 */
	private void addBoxedSection1(Document document, String text, int fontSize) throws DocumentException {
		PdfPTable table = new PdfPTable(1); // Create a table with one column
		table.setWidthPercentage(100); // Set the table to occupy the full width
		PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, fontSize)));
		cell.setHorizontalAlignment(Element.ALIGN_CENTER);
		cell.setBorder(Rectangle.BOX);
		cell.setPadding(8);
		table.addCell(cell);
		document.add(table);
	}

	/**
	 * Adds a boxed section with right-aligned text to the PDF document.
	 *
	 * @param document The PDF document where the section will be added.
	 * @param text     The text content of the section.
	 * @param fontSize The font size of the text.
	 * @throws DocumentException If an error occurs while adding the section.
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
	 * Adds a watermark logo to the PDF document.
	 *
	 * @param writer The PdfWriter instance used to write the document.
	 * @throws DocumentException   If an error occurs while adding the watermark.
	 * @throws java.io.IOException If an error occurs while loading the image.
	 */
	private void addWatermarkLogo(PdfWriter writer) throws DocumentException, java.io.IOException {
		PdfContentByte canvas = writer.getDirectContentUnder();
		String logoPath = "src/main/resources/static/img/pageLogo.png";
		Image watermarkLogo = Image.getInstance(logoPath);
		// Scale the watermark logo
		watermarkLogo.scaleToFit(400, 400);
		watermarkLogo.setAbsolutePosition(200, 220);

		// Set opacity (transparency) for the watermark
		PdfGState gstate = new PdfGState();
		gstate.setFillOpacity(0.2f);
		canvas.setGState(gstate);
		canvas.addImage(watermarkLogo);
	}

	/**
	 * Adds user details to the PDF document.
	 *
	 * @param document       The PDF document where user details will be added.
	 * @param userDTO        The user information.
	 * @param taxCalculation The tax calculation details.
	 * @throws DocumentException If an error occurs while adding the user details.
	 */
	private void addUserDetails(Document document, UserDTO userDTO, TaxCalculation taxCalculation)
			throws DocumentException {
		PdfPTable table = new PdfPTable(3);
		table.setWidthPercentage(100);
		table.setWidths(new float[] { 2, 2, 1 });

		// Adding the table headers
		addTableHeader(table, "TaxPayer Name");
		addTableHeader(table, "PAN");
		addTableHeader(table, "Tax Year");

		// Adding user-specific data in rows
		addTableRow(table, userDTO.getName());
		addTableRow(table, userDTO.getGovernmentId());
		addTableRow(table, taxCalculation.getTaxYear().toString());

		document.add(table);
		document.add(Chunk.NEWLINE);
	}

	/**
	 * Adds income details to the PDF document.
	 *
	 * @param document       The PDF document where income details will be added.
	 * @param incomes        The list of income sources.
	 * @param taxCalculation The tax calculation details.
	 * @throws DocumentException If an error occurs while adding income details.
	 */
	private void addIncomeDetails(Document document, List<Income> incomes, TaxCalculation taxCalculation)
			throws DocumentException {
		document.add(new Paragraph("Section A: Income Details", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));

		PdfPTable table = new PdfPTable(2);
		table.setWidthPercentage(100);

		// Adding income data for each income source
		for (Income income : incomes) {
			addTableRow(table, income.getIncomeSource(), income.getAmount().toString());
		}
		addTableRow(table, GROSS_INCOME, taxCalculation.getGrossIncome().toString());

		document.add(table);
		document.add(Chunk.NEWLINE);
	}

	/**
	 * Adds deduction details to the PDF document.
	 *
	 * @param document       The PDF document where deduction details will be added.
	 * @param deductions     The list of deductions.
	 * @param taxCalculation The tax calculation details.
	 * @throws DocumentException If an error occurs while adding deduction details.
	 */
	private void addDeductionDetails(Document document, List<Deduction> deductions, TaxCalculation taxCalculation)
			throws DocumentException {
		document.add(new Paragraph("Section B: Deductions", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));

		PdfPTable table = new PdfPTable(2);
		table.setWidthPercentage(100);

		// Adding deduction data for each deduction type
		for (Deduction deduction : deductions) {
			addTableRow(table, deduction.getDeductionType(), deduction.getAmount().toString());
		}
		addTableRow(table, TOTAL_DEDUCTIONS, taxCalculation.getDeductions().toString());

		document.add(table);
		document.add(Chunk.NEWLINE);
	}

	/**
	 * Adds taxable income details to the PDF document.
	 *
	 * @param document       The PDF document where taxable income details will be
	 *                       added.
	 * @param taxCalculation The tax calculation details.
	 * @throws DocumentException If an error occurs while adding taxable income
	 *                           details.
	 */
	private void addTaxableIncome(Document document, TaxCalculation taxCalculation) throws DocumentException {
		document.add(
				new Paragraph("Section C: Taxable Income (A-B)", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));

		PdfPTable table = new PdfPTable(2);
		table.setWidthPercentage(100);

		// Adding taxable income data
		addTableRow(table, TAXABLE_INCOME, taxCalculation.getTaxableIncome().toString());

		document.add(table);
		document.add(Chunk.NEWLINE);
	}

	/**
	 * Adds tax liability details to the PDF document.
	 *
	 * @param document       The PDF document where tax liability details will be
	 *                       added.
	 * @param taxCalculation The tax calculation details.
	 * @throws DocumentException If an error occurs while adding tax liability
	 *                           details.
	 */
	private void addTaxLiability(Document document, TaxCalculation taxCalculation) throws DocumentException {
		document.add(new Paragraph("Section D: Tax Liability", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));

		PdfPTable table = new PdfPTable(2);
		table.setWidthPercentage(100);

		addTableRow(table, TOTAL_TAX, taxCalculation.getTaxLiability().toString());

		document.add(table);
		document.add(Chunk.NEWLINE);
	}

	/**
	 * Adds payment details to the PDF document.
	 *
	 * @param document The PDF document where payment details will be added.
	 * @param payments The list of tax payments.
	 * @throws DocumentException If an error occurs while adding payment details.
	 */
	private void addPaymentDetails(Document document, List<TaxPayment> payments) throws DocumentException {
		document.add(new Paragraph("Section E: Payment Details", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
		// Filter payments to only include those after January 1, 2025
		TaxPayment payment = payments.stream().filter(p -> p.getPaymentDate().isAfter(LocalDate.of(2025, 01, 01)))
				.toList().get(0);

		PdfPTable table = new PdfPTable(3);
		table.setWidthPercentage(100);
		table.setWidths(new float[] { 2, 1, 2 });

		// If a valid payment is found, add details to the table
		if (payment != null) {
			addTableHeader(table, "Transaction Id");
			addTableHeader(table, "Amount Paid");
			addTableHeader(table, "Payment Date");

			addTableRow(table, payment.getTransactionId(), payment.getAmountPaid().toString(),
					payment.getPaymentDate().toString());

			document.add(table);
			document.add(Chunk.NEWLINE);
		}
	}

	/**
	 * Adds a footer to the document.
	 *
	 * @param writer PdfWriter instance to write the footer.
	 */
	private void addFooter(PdfWriter writer) {
		writer.setPageEvent(new PdfPageEventHelper() {
			@Override
			public void onEndPage(PdfWriter writer, Document document) {
				Rectangle page = document.getPageSize();
				float x = (page.getLeft(20) + page.getRight(20)) / 2;
				float y = page.getBottom(30);
				Phrase footerText = new Phrase("Tax Department | www.cleartax.gov | Contact: support@cleartax.gov",
						FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8));
				ColumnText.showTextAligned(writer.getDirectContent(), Element.ALIGN_CENTER, footerText, x, y, 0);
			}
		});
	}

	/**
	 * Adds a table header with a given label.
	 *
	 * @param table PdfPTable instance to add the header.
	 * @param label The label for the header cell.
	 */
	private void addTableHeader(PdfPTable table, String label) {
		PdfPCell cell = new PdfPCell(new Phrase(label, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
		cell.setHorizontalAlignment(Element.ALIGN_CENTER); // Center the text
		table.addCell(cell);
	}

	/**
	 * Adds a row to a table with multiple values.
	 *
	 * @param table  PdfPTable instance to add the row.
	 * @param values Values to be added as cells in the row.
	 */
	private void addTableRow(PdfPTable table, String... values) {
		// For each value, add it as a new cell to the row
		for (String value : values) {
			table.addCell(new PdfPCell(new Phrase(value)));
		}
	}

	/**
	 * Adds the Amendment section (if applicable) to the PDF.
	 *
	 * @param document                The PDF document.
	 * @param amendmentIncomes        List of amended incomes.
	 * @param amendmentDeductions     List of amended deductions.
	 * @param amendmentTaxCalculation Tax calculation details for the amendment.
	 * @throws DocumentException If there is an error adding content to the
	 *                           document.
	 */
	private void addAmendmentSection(Document document, List<Income> amendmentIncomes,
			List<Deduction> amendmentDeductions, TaxCalculation amendmentTaxCalculation) throws DocumentException {
		addSectionHeader(document, "Amendment Summary");

		PdfPTable table = createTable(2);
		addSectionHeader(document, "Incomes : Section - A-i");
		for (Income income : amendmentIncomes) {
			addTableRow(table, "Income Source: " + income.getIncomeSource(), income.getAmount().toString());
		}
		addTableRow(table, GROSS_INCOME, String.valueOf(amendmentTaxCalculation.getGrossIncome()));
		document.add(table);

		table = createTable(2);
		addSectionHeader(document, "Deductions : Section - B-i");
		for (Deduction deduction : amendmentDeductions) {
			addTableRow(table, "Deduction Type: " + deduction.getDeductionType(), deduction.getAmount().toString());
		}
		addTableRow(table, TOTAL_DEDUCTIONS, String.valueOf(amendmentTaxCalculation.getDeductions()));
		document.add(table);

		table = createTable(2);
		addSectionHeader(document, "Taxable Income : Section - C");
		addTableRow(table, TAXABLE_INCOME, String.valueOf(amendmentTaxCalculation.getTaxableIncome()));
		document.add(table);

		table = createTable(2);
		addSectionHeader(document, "Tax Liability : Section - D-i");
		addTableRow(table, TOTAL_TAX, String.valueOf(amendmentTaxCalculation.getTaxLiability()));
		document.add(table);
	}

	/**
	 * Creates a table with the specified number of columns.
	 *
	 * @param numColumns Number of columns in the table.
	 * @return PdfPTable instance with the specified column count.
	 * @throws DocumentException If there is an error creating the table.
	 */
	private PdfPTable createTable(int numColumns) throws DocumentException {
		PdfPTable table = new PdfPTable(numColumns);
		table.setWidths(new float[] { 1, 2 });
		table.setWidthPercentage(100);
		return table;
	}

	/**
	 * Adds a section header to the document.
	 *
	 * @param document     The PDF document.
	 * @param sectionTitle The title of the section.
	 * @throws DocumentException If there is an error adding content to the
	 *                           document.
	 */
	private void addSectionHeader(Document document, String sectionTitle) throws DocumentException {
		PdfPTable table = createTable(2);
		addTableRow(table, sectionTitle, "");
		document.add(table);
	}

	/**
	 * Generates and adds the header section to the document.
	 *
	 * @param document The PDF document.
	 * @throws DocumentException If there is an error adding content to the
	 *                           document.
	 */
	protected void generateHeader(Document document) throws DocumentException {
		// Adds the logo at the top left of the document
		addLogoToPDF(document);

		// Adds the title and date details to the document
		document.add(new Paragraph("Tax Transcript", FontFactory.getFont(FontFactory.COURIER_BOLD, 16, Font.BOLD)));
		document.add(Chunk.NEWLINE);
		Paragraph transcriptType = new Paragraph("Transcript_1040", FontFactory.getFont(FontFactory.COURIER_BOLD, 15));
		transcriptType.setAlignment(Element.ALIGN_RIGHT);
		document.add(transcriptType);

		String todayDate = LocalDate.now().toString();
		Paragraph dateParagraph = new Paragraph("Transcript Date :" + todayDate,
				FontFactory.getFont(FontFactory.COURIER, 12));
		dateParagraph.setAlignment(Element.ALIGN_RIGHT);
		document.add(dateParagraph);

		Paragraph requestDateParagraph = new Paragraph("Date of Request: " + todayDate,
				FontFactory.getFont(FontFactory.COURIER, 12));
		requestDateParagraph.setAlignment(Element.ALIGN_RIGHT);
		document.add(requestDateParagraph);

		document.add(Chunk.NEWLINE);
	}

	/**
	 * Generates and adds a table containing the user's personal information.
	 *
	 * @param document       The PDF document.
	 * @param userDTO        User details.
	 * @param taxCalculation Tax calculation details.
	 * @throws DocumentException If there is an error adding content to the
	 *                           document.
	 */
	private void generatePersonalInfoTable(Document document, UserDTO userDTO, TaxCalculation taxCalculation)
			throws DocumentException {
		// Creates a table for personal information
		PdfPTable table = new PdfPTable(2);
		table.setWidths(new float[] { 2, 1 });
		table.setWidthPercentage(100);
		addTableRow2(table, "Taxpayer Name:", userDTO.getName() != null ? userDTO.getName() : "N/A");
		addTableRow2(table, "PAN:", userDTO.getGovernmentId() != null ? userDTO.getGovernmentId() : "N/A");
		addTableRow2(table, "Aadhaar No:", "N/A");
		addTableRow2(table, "Address:", "N/A");
		addTableRow2(table, "Contact Info: Email: ",
				(userDTO.getEmail() != null ? userDTO.getEmail() : "N/A") + ", Phone No: N/A");

		document.add(table);
		table.deleteBodyRows();

		// Adding tax year information
		addTableRow2(table, "Assessment Year:",
				taxCalculation.getTaxYear() != null ? taxCalculation.getTaxYear().toString() : "N/A");
		document.add(table);
		table.deleteBodyRows();
	}

	/**
	 * Generates and adds the income details table to the document.
	 *
	 * @param document       The PDF document.
	 * @param incomes        List of income details.
	 * @param taxCalculation Tax calculation details.
	 * @throws DocumentException If there is an error adding content to the
	 *                           document.
	 */
	protected void generateIncomeDetails(Document document, List<Income> incomes, TaxCalculation taxCalculation)
			throws DocumentException {
		// Adds income details table to the document
		document.add(new Paragraph("Income Details", FontFactory.getFont(FontFactory.COURIER_BOLD, 14)));
		document.add(new Chunk());
		PdfPTable incomeTable = new PdfPTable(2);
		incomeTable.setWidths(new float[] { 2, 1 });
		incomeTable.setWidthPercentage(100);
		for (Income income : incomes) {
			addTableRow2(incomeTable,
					"Income Source: " + (income.getIncomeSource() != null ? income.getIncomeSource() : "N/A"),
					income.getAmount() != null ? income.getAmount().toString() : "0");
		}
		addTableRow2(incomeTable, "Total Income:",
				taxCalculation.getGrossIncome() != null ? taxCalculation.getGrossIncome().toString() : "0");
		document.add(incomeTable);
		incomeTable.deleteBodyRows();
	}

	/**
	 * Generates and adds the deduction details table to the document.
	 *
	 * @param document       The PDF document.
	 * @param deductions     List of deduction details.
	 * @param taxCalculation Tax calculation details.
	 * @throws DocumentException If there is an error adding content to the
	 *                           document.
	 */
	private void generateDeductionDetails(Document document, List<Deduction> deductions, TaxCalculation taxCalculation)
			throws DocumentException {
		// Adds deduction details table to the document
		document.add(new Paragraph("Deductions Details", FontFactory.getFont(FontFactory.COURIER_BOLD, 14)));
		document.add(new Chunk());
		PdfPTable deductionTable = new PdfPTable(2);
		deductionTable.setWidths(new float[] { 2, 1 });
		deductionTable.setWidthPercentage(100);
		for (Deduction deduction : deductions) {
			addTableRow2(deductionTable,
					"Deduction Type: " + (deduction.getDeductionType() != null ? deduction.getDeductionType() : "N/A"),
					deduction.getAmount() != null ? deduction.getAmount().toString() : "0");
		}
		addTableRow2(deductionTable, TOTAL_DEDUCTIONS,
				taxCalculation.getDeductions() != null ? taxCalculation.getDeductions().toString() : "0");
		document.add(deductionTable);
		deductionTable.deleteBodyRows();
	}

	/**
	 * Generates and adds the tax calculation details table to the document.
	 *
	 * @param document       The PDF document.
	 * @param taxCalculation Tax calculation details.
	 * @throws DocumentException If there is an error adding content to the
	 *                           document.
	 */
	private void generateTaxCalculation(Document document, TaxCalculation taxCalculation) throws DocumentException {
		// Adds tax calculation details table to the document
		document.add(new Paragraph("Tax Calculation", FontFactory.getFont(FontFactory.COURIER_BOLD, 14)));
		document.add(new Chunk());
		PdfPTable table = new PdfPTable(2);
		table.setWidths(new float[] { 2, 1 });
		table.setWidthPercentage(100);
		addTableRow2(table, "Gross Tax Payable:",
				taxCalculation.getTaxableIncome() != null ? taxCalculation.getTaxableIncome().toString() : "0");
		addTableRow2(table, "Tax Paid:",
				taxCalculation.getTaxLiability() != null ? taxCalculation.getTaxLiability().toString() : "0");
		addTableRow2(table, "Interest on Tax:", "0");
		document.add(table);
		table.deleteBodyRows();
	}

	/**
	 * Generates and adds the amendment details table to the document if applicable.
	 *
	 * @param document                The PDF document.
	 * @param amendmentIncomes        List of amended incomes.
	 * @param amendmentDeductions     List of amended deductions.
	 * @param amendmentTaxCalculation Tax calculation details for the amendment.
	 * @throws DocumentException If there is an error adding content to the
	 *                           document.
	 */
	private void generateAmendmentDetails(Document document, List<Income> amendmentIncomes,
			List<Deduction> amendmentDeductions, TaxCalculation amendmentTaxCalculation) throws DocumentException {
		// Generate amendment details table if there are any amendments
		document.add(new Paragraph("Amendment Details", FontFactory.getFont(FontFactory.COURIER_BOLD, 14)));
		document.add(new Chunk());
		PdfPTable table = new PdfPTable(2);
		// Populate amendment details table...
		addAmendmentSection(document, amendmentIncomes, amendmentDeductions, amendmentTaxCalculation);
		document.add(table);
		table.deleteBodyRows();
	}

	/**
	 * Generates and adds the payment history details table to the document.
	 *
	 * @param document    The PDF document.
	 * @param taxPayments List of tax payments.
	 * @throws DocumentException If there is an error adding content to the
	 *                           document.
	 */
	private void generatePaymentHistory(Document document, List<TaxPayment> taxPayments) throws DocumentException {
		// Adds payment history details table to the document
		document.add(new Paragraph("Payment History", FontFactory.getFont(FontFactory.COURIER_BOLD, 14)));
		document.add(new Chunk());
		PdfPTable paymentTable = new PdfPTable(2);
		paymentTable.setWidths(new float[] { 2, 1 });
		paymentTable.setWidthPercentage(100);
		for (TaxPayment payment : taxPayments) {
			addTableRow2(paymentTable, "Payment Date:",
					payment.getPaymentDate() != null ? payment.getPaymentDate().toString() : "N/A");
			addTableRow2(paymentTable, "Payment Amount:",
					payment.getAmountPaid() != null ? payment.getAmountPaid().toString() : "0");
		}
		document.add(paymentTable);
		paymentTable.deleteBodyRows();
	}

	/**
	 * Adds a row to the table with two columns (label and value).
	 *
	 * @param table PdfPTable instance to add the row.
	 * @param label The label for the row.
	 * @param value The value corresponding to the label.
	 */
	private void addTableRow2(PdfPTable table, String label, String value) {
		// Adds a row to the table with two columns (label and value)
		table.addCell(new Phrase(label));
		table.addCell(new Phrase(value));
	}

	/**
	 * Adds a row to the table with a label and a right-aligned value.
	 *
	 * @param table PdfPTable instance to add the row.
	 * @param label The label for the row.
	 * @param value The value corresponding to the label.
	 */
	private void addTableRow(PdfPTable table, String label, String value) {
		PdfPCell cell = new PdfPCell(new Phrase(label));
		table.addCell(cell);

		cell = new PdfPCell(new Phrase(value));
		cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
		table.addCell(cell);
	}

}