package com.gov.tax.service.impl;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.gov.tax.dto.RefundStatusUpdateRequest;
import com.gov.tax.entity.TaxRefund;
import com.gov.tax.exception.ResourceNotFoundException;
import com.gov.tax.mapper.UserMapper;
import com.gov.tax.repository.TaxRefundRepository;
import com.gov.tax.service.TaxRefundService;
import com.gov.tax.service.UserService;
import com.itextpdf.io.source.ByteArrayOutputStream;
import com.itextpdf.text.BaseColor;
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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaxRefundServiceImpl implements TaxRefundService {

	private final TaxRefundRepository taxRefundRepository;
	private final UserMapper userMapper;
	private final UserService userService;
	private static final Logger logger = LoggerFactory.getLogger(TaxRefundServiceImpl.class);

	/**
	 * Creates a tax refund entry for a user and saves it in the database.
	 *
	 * @param userId       The ID of the user requesting a tax refund.
	 * @param refundAmount The amount to be refunded.
	 */
	@Override
	public void createRefund(Long userId, BigDecimal refundAmount) {
		TaxRefund taxRefund = createTaxRefund(userId, refundAmount);
		taxRefundRepository.save(taxRefund);
	}

	/**
	 * Retrieves the tax refund details for a given user.
	 *
	 * @param userId The ID of the user whose refund details are being retrieved.
	 * @return The TaxRefund entity containing refund details.
	 * @throws ResourceNotFoundException if no tax refund exists for the user.
	 */
	@Override
	public TaxRefund getTaxRefund(Long userId) {
		TaxRefund taxRefund = taxRefundRepository.findByUserUserId(userId);
		if (taxRefund == null) {
			throw new ResourceNotFoundException("Tax refund Not Exits");
		}
		return taxRefund;
	}

	/**
	 * Updates the refund status of a user's tax refund.
	 *
	 * @param userId  The ID of the user whose refund status is being updated.
	 * @param request The request object containing the new refund status.
	 * @return The updated TaxRefund entity.
	 * @throws ResourceNotFoundException if no tax refund exists for the user.
	 */
	@Override
	public TaxRefund updateRefundStatus(Long userId, RefundStatusUpdateRequest request) {
		TaxRefund taxRefund = getTaxRefund(userId);
		updateRefundStatus(taxRefund, request);
		return taxRefundRepository.save(taxRefund);
	}

	/**
	 * Generates and fetches a tax refund certificate as a PDF for a given user.
	 *
	 * @param userId The ID of the user requesting the refund certificate.
	 * @return A byte array containing the generated PDF.
	 * @throws IOException       If an error occurs while reading resources.
	 * @throws DocumentException If an error occurs while generating the document.
	 */
	@Override
	public byte[] fetchRefundCertificate(Long userId) throws IOException, DocumentException {
		TaxRefund taxRefund = getTaxRefund(userId);
		return generateRefundCertificate(taxRefund);
	}

	/**
	 * Helper method to create a new TaxRefund entity.
	 *
	 * @param userId       The ID of the user receiving the tax refund.
	 * @param refundAmount The amount of the refund.
	 * @return The newly created TaxRefund entity.
	 */
	private TaxRefund createTaxRefund(Long userId, BigDecimal refundAmount) {
		return TaxRefund.builder().user(userMapper.toEntity(userService.getUserById(userId))).refundAmount(refundAmount)
				.refundStatus("Pending").refundDate(LocalDate.now()).build();
	}

	/**
	 * Updates the refund status of a given TaxRefund entity.
	 *
	 * @param taxRefund The TaxRefund entity to update.
	 * @param request   The request object containing the new refund status.
	 */
	private void updateRefundStatus(TaxRefund taxRefund, RefundStatusUpdateRequest request) {
		taxRefund.setRefundStatus(request.getRefundStatus());
	}

	/**
	 * Generates a PDF certificate for a given TaxRefund.
	 *
	 * @param taxRefund The TaxRefund entity for which the certificate is generated.
	 * @return A byte array containing the generated PDF.
	 * @throws IOException       If an error occurs while reading resources.
	 * @throws DocumentException If an error occurs while creating the PDF.
	 */
	private byte[] generateRefundCertificate(TaxRefund taxRefund) throws DocumentException, IOException {
		try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
			Document document = new Document(PageSize.A4.rotate());
			PdfWriter writer = PdfWriter.getInstance(document, outputStream);
			document.open();

			// Add Header Table
			PdfPTable headerTable = createHeaderTable();
			document.add(headerTable);

			// Add Watermark
			addWatermarkLogo(writer);

			// Add Certificate Content
			Paragraph certificateText = createCertificateText(taxRefund);
			document.add(certificateText);

			// add signeture
			addSignatureToPdf(document, "src/main/resources/static/img/signature.png");

			// add Name
			addNameToPdf(document, "R. P. Agarwal");

			// add name title
			addNameTitleToPdf(document, "Chairman");

			// Add Footer
			addFooter(writer);

			// Close Document and Return ByteArray
			document.close();
			return outputStream.toByteArray();
		}
	}

	/**
	 * Creates a header table for the tax refund certificate PDF.
	 *
	 * @return A PdfPTable containing header elements.
	 * @throws DocumentException If an error occurs while creating the table.
	 * @throws IOException       If an error occurs while reading image resources.
	 */
	private PdfPTable createHeaderTable() throws DocumentException, IOException {
		PdfPTable table = new PdfPTable(3);
		table.setWidthPercentage(100);

		// Column widths
		float[] columnWidths = { 1f, 5f, 1f };
		table.setWidths(columnWidths);

		// Left Logo
		addLogoToTable(table, "src/main/resources/static/img/pageLogo.png", Element.ALIGN_BOTTOM);

		// Center Text
		addCenterTextToTable(table);

		// Right Logo
		addLogoToTable(table, "src/main/resources/static/img/certificateLogo.png", Element.ALIGN_RIGHT);

		return table;
	}

	/**
	 * Adds a logo to a given table cell.
	 *
	 * @param table     The PdfPTable to which the logo is added.
	 * @param logoPath  The file path to the logo image.
	 * @param alignment The alignment of the logo within the cell.
	 * @throws DocumentException If an error occurs while processing the table.
	 * @throws IOException       If an error occurs while reading the logo file.
	 */
	private void addLogoToTable(PdfPTable table, String logoPath, int alignment) throws DocumentException, IOException {
		try {
			Image logo = Image.getInstance(logoPath);
			logo.scaleToFit(180, 150);
			PdfPCell logoCell = new PdfPCell(logo, false);
			logoCell.setBorder(Rectangle.NO_BORDER);
			logoCell.setHorizontalAlignment(alignment);
			table.addCell(logoCell);
		} catch (Exception e) {
		    logger.error("Error adding logo: {}", e.getMessage(), e);
		}
	}

	/**
	 * Adds center-aligned text to the header table.
	 *
	 * @param table The PdfPTable to which the text is added.
	 */
	private void addCenterTextToTable(PdfPTable table) {
		Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 28, BaseColor.BLUE);
		Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLDOBLIQUE, 20, BaseColor.BLUE);

		PdfPCell centerTextCell = new PdfPCell();
		centerTextCell.setBorder(Rectangle.NO_BORDER);

		// Add Text
		Paragraph title = new Paragraph("Ministry of Finance", headerFont);
		title.setAlignment(Element.ALIGN_CENTER);
		centerTextCell.addElement(title);

		Paragraph subtitle = new Paragraph("Government of India", subHeaderFont);
		subtitle.setAlignment(Element.ALIGN_CENTER);
		centerTextCell.addElement(subtitle);

		Paragraph cbdt = new Paragraph("Central Board of Direct Taxes", subHeaderFont);
		cbdt.setAlignment(Element.ALIGN_CENTER);
		centerTextCell.addElement(cbdt);

		table.addCell(centerTextCell);
	}

	/**
	 * Adds a watermark logo to the PDF document.
	 *
	 * @param writer The PdfWriter instance managing the document.
	 * @throws DocumentException If an error occurs while manipulating the PDF.
	 * @throws IOException       If an error occurs while reading the watermark
	 *                           image.
	 */
	private void addWatermarkLogo(PdfWriter writer) throws DocumentException, java.io.IOException {
		PdfContentByte canvas = writer.getDirectContentUnder();
		String logoPath = "src/main/resources/static/img/certificateLogo.png";
		Image watermarkLogo = Image.getInstance(logoPath);
		// Scale the watermark logo
		watermarkLogo.scaleToFit(600, 600);
		watermarkLogo.setAbsolutePosition(250, -10);

		// Set opacity (transparency) for the watermark
		PdfGState gstate = new PdfGState();
		gstate.setFillOpacity(0.2f);
		canvas.setGState(gstate);
		canvas.addImage(watermarkLogo);
	}

	/**
	 * Creates the main content paragraph for the tax refund certificate.
	 *
	 * @param taxRefund The TaxRefund entity containing user and refund details.
	 * @return A Paragraph containing the certificate text.
	 */
	private Paragraph createCertificateText(TaxRefund taxRefund) {
		Font contentFont = FontFactory.getFont(FontFactory.HELVETICA, 20, BaseColor.BLACK);
		return new Paragraph("This is to certify that Mr./Ms. " + taxRefund.getUser().getName()
				+ " has received an income tax refund for the tax year " + taxRefund.getRefundDate().getYear()
				+ ".\n\nRefund Amount: ₹" + taxRefund.getRefundAmount().toString() + "\n\n"
				+ "This certificate is issued under the authority of the Central Board of Direct Taxes for your reference and records."
				+ " The refund has been processed and is completed the final approval and transfer to the recipient's account.",
				contentFont);
	}

	/**
	 * Adds the authorized signer's name to the bottom right of the PDF.
	 *
	 * @param document The PDF document to which the name is added.
	 * @param userName The name of the authorized signer.
	 * @throws DocumentException If an error occurs while adding text to the
	 *                           document.
	 */
	private void addNameToPdf(Document document, String userName) throws DocumentException {
		Paragraph nameParagraph = new Paragraph(userName, new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD));
		nameParagraph.setAlignment(Element.ALIGN_RIGHT);
		document.add(nameParagraph);
	}

	/**
	 * Adds the authorized signer's title to the bottom right of the PDF.
	 *
	 * @param document      The PDF document to which the title is added.
	 * @param userNameTitle The title of the authorized signer.
	 * @throws DocumentException If an error occurs while adding text to the
	 *                           document.
	 */
	private void addNameTitleToPdf(Document document, String userNameTitle) throws DocumentException {
		Paragraph nameParagraph = new Paragraph(userNameTitle, new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD));
		nameParagraph.setAlignment(Element.ALIGN_RIGHT);
		nameParagraph.setIndentationRight(20);
		document.add(nameParagraph);
	}

	/**
	 * Adds an authorized signature image to the PDF.
	 *
	 * @param document The PDF document to which the signature is added.
	 * @param signPath The file path to the signature image.
	 * @throws IOException       If an error occurs while reading the image file.
	 * @throws DocumentException If an error occurs while adding the image to the
	 *                           document.
	 */
	private void addSignatureToPdf(Document document, String signPath) throws IOException, DocumentException {
		Image signature = Image.getInstance(signPath);
		signature.scaleToFit(100, 70);
		signature.setAlignment(Element.ALIGN_RIGHT);
		signature.setSpacingBefore(20);
		document.add(signature);
	}

	/**
	 * Adds a footer to each page of the PDF document. The footer contains the tax
	 * department's contact information.
	 *
	 * @param writer The PdfWriter instance managing the document.
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
