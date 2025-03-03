package com.gov.tax.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.json.JSONException;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.gov.tax.dto.UserDTO;
import com.gov.tax.entity.Deduction;
import com.gov.tax.entity.Income;
import com.gov.tax.entity.TaxCalculation;
import com.gov.tax.entity.TaxPayment;
import com.gov.tax.entity.User;
import com.gov.tax.exception.ResourceNotFoundException;
import com.gov.tax.mapper.UserMapper;
import com.gov.tax.repository.TaxCalculationRepository;
import com.gov.tax.repository.TaxPaymentRepository;
import com.gov.tax.service.DeductionService;
import com.gov.tax.service.IncomeService;
import com.gov.tax.service.TaxPaymentService;
import com.gov.tax.service.UserService;
import com.itextpdf.io.exceptions.IOException;
import com.itextpdf.text.DocumentException;
import com.razorpay.Order;
import com.razorpay.OrderClient;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;

@ExtendWith(MockitoExtension.class)
class TaxPaymentServiceImplTest {

	@InjectMocks
	private TaxPaymentServiceImpl taxPaymentService;

	@Mock
	private TaxPaymentRepository taxPaymentRepository;

	@Mock
	private UserService userService;

	@Mock
	private UserMapper userMapper;

	@Mock
	private IncomeService incomeService;

	@Mock
	private DeductionService deductionService;

	@Mock
	private TaxCalculationRepository taxCalculationRepository;

	@Mock
	private RazorpayClient razorpayClient;

	@Mock
	private OrderClient orderClient;

	@Mock
	private Order mockOrder;

	private UserDTO mockUser;
	private Income testIncome;
	private Deduction testDeduction;
	private List<Income> mockIncomes;
	private List<Deduction> mockDeductions;
	private TaxPayment mockTaxPayment;
	private TaxCalculation mockTaxCalculation;
	private List<TaxPayment> mockTaxPayments;
    private TaxCalculation mockAmendmentTaxCalculation;

	@BeforeEach
	void setUp() throws RazorpayException {
		mockUser = new UserDTO();
		mockUser.setUserId(1L);

		testIncome = new Income();
		testIncome.setAmount(new BigDecimal("500000"));
		testIncome.setIncomeDate(LocalDate.of(2025, 1, 1));

		testDeduction = new Deduction();
		testDeduction.setAmount(new BigDecimal("50000"));
		testDeduction.setDeductionDate(LocalDate.of(2025, 1, 1));

		mockIncomes = List.of(testIncome);
		mockDeductions = List.of(testDeduction);

		mockTaxCalculation = new TaxCalculation();
		mockTaxCalculation.setUser(new User());
		mockTaxCalculation.setDeductions(new BigDecimal(0));
		mockTaxCalculation.setGrossIncome(new BigDecimal(0));
		mockTaxCalculation.setTaxableIncome(new BigDecimal(0));
		mockTaxCalculation.setTaxLiability(new BigDecimal(0));
		mockTaxCalculation.setTaxYear(Year.now());
		mockTaxCalculation.setIsAmended(0);
		
		mockAmendmentTaxCalculation = new TaxCalculation();
		mockAmendmentTaxCalculation.setTaxCalculationId(1L);
		mockAmendmentTaxCalculation.setDeductions(new BigDecimal(0));
		mockAmendmentTaxCalculation.setGrossIncome(new BigDecimal(0));
		mockAmendmentTaxCalculation.setTaxableIncome(new BigDecimal(0));
		mockAmendmentTaxCalculation.setTaxLiability(new BigDecimal(0));
		mockAmendmentTaxCalculation.setTaxYear(Year.now());
		mockAmendmentTaxCalculation.setIsAmended(1);

		mockTaxPayment = new TaxPayment();
		mockTaxPayment.setPaymentStatus("Pending");
		mockTaxPayment.setAmountPaid(BigDecimal.valueOf(5000));
		mockTaxPayment.setTransactionId(null);

		mockTaxPayments = new ArrayList<>();
		mockTaxPayments.add(mockTaxPayment);
		TaxPayment completedPayment = new TaxPayment();
		completedPayment.setPaymentStatus("Completed");

		TaxPayment pendingPayment = new TaxPayment();
		pendingPayment.setPaymentStatus("Pending");

		mockTaxPayments = Arrays.asList(completedPayment, pendingPayment);

		mockOrder = mock(Order.class);
		orderClient = mock(OrderClient.class);
		razorpayClient = mock(RazorpayClient.class);

		// Use ReflectionTestUtils to set the private "orders" field in RazorpayClient
		ReflectionTestUtils.setField(razorpayClient, "orders", orderClient);
		this.razorpayClient = new RazorpayClient("rzp_test_5NRyDfXiLxWsWe", "Vo7s94y4oUInLSUZ4Vq3w8gN");

	}

// =====getTaxPaymentByUserId()======================
	@Test
	void testGetTaxPaymentByUserId_Success() {
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(mockTaxPayments);
		TaxPayment result = taxPaymentService.getTaxPaymentByUserId(1L);
		assertNotNull(result);
		assertEquals("Pending", result.getPaymentStatus());
	}

	@Test
	void testGetTaxPaymentByUserId_NoDataFound() {
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(Collections.emptyList());
		assertThrows(ResourceNotFoundException.class, () -> taxPaymentService.getTaxPaymentByUserId(1L));
	}

	@Test
	void testGetTaxPaymentByUserId_Success_PendingPaymentFound() {
		// Ensure one of the payments is "Pending"
		TaxPayment pendingPayment = new TaxPayment();
		pendingPayment.setPaymentStatus("Pending");

		List<TaxPayment> taxPayments = List.of(pendingPayment, // Pending payment found
				createTaxPayment("Completed"), createTaxPayment("Failed"));

		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(taxPayments);

		TaxPayment result = taxPaymentService.getTaxPaymentByUserId(1L);

		assertNotNull(result);
		assertEquals("Pending", result.getPaymentStatus());
	}

	@Test
	void testGetTaxPaymentByUserId_NoPendingPayment() {
		// No "Pending" status in tax payments
		List<TaxPayment> taxPayments = List.of(createTaxPayment("Completed"), createTaxPayment("Failed"),
				createTaxPayment("Refunded"));

		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(taxPayments);

		ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
				() -> taxPaymentService.getTaxPaymentByUserId(1L));

		assertEquals("No Tax Payments found with NULL transactionId!", exception.getMessage());
	}

	// Utility method to create TaxPayment with different statuses
	private TaxPayment createTaxPayment(String status) {
		TaxPayment taxPayment = new TaxPayment();
		taxPayment.setPaymentStatus(status);
		return taxPayment;
	}

//================getTaxPaymentByUserIdAndTransactionId()===================================	

	@Test
	void testGetTaxPaymentByUserIdAndTransactionId_Success() {
		when(taxPaymentRepository.findByUserUserIdAndTransactionId(1L, "txn123")).thenReturn(mockTaxPayment);
		TaxPayment result = taxPaymentService.getTaxPaymentByUserIdAndTransactionId(1L, "txn123");
		assertNotNull(result);
		assertEquals("Pending", result.getPaymentStatus());
	}

	@Test
	void testGetTaxPaymentByUserIdAndTransactionId_NotFound() {
		when(taxPaymentRepository.findByUserUserIdAndTransactionId(1L, "txn123")).thenReturn(null);
		assertThrows(ResourceNotFoundException.class,
				() -> taxPaymentService.getTaxPaymentByUserIdAndTransactionId(1L, "txn123"));
	}

//============================payTaxAtRazorpay()==============================
	@Test
	void testPayTaxAtRazorpay_Success() throws RazorpayException, JSONException {
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(mockTaxPayments);
		when(taxCalculationRepository.findByUserUserIdAndTaxYearAndIsAmended(anyLong(), any(), anyInt()))
				.thenReturn(Optional.of(mockTaxCalculation));

		JSONObject orderResponse = new JSONObject();
		orderResponse.put("id", "razorpay_order_123");

		when(orderClient.create(any())).thenReturn(mockOrder);
		when(mockOrder.get("id")).thenReturn("razorpay_order_123");

		// Call the method
		TaxPayment result = taxPaymentService.payTaxAtRazorpay(1L, 0);

		// Assertions
		assertNotNull(result);
		assertEquals("Pending", result.getPaymentStatus());
		assertEquals("razorpay_order_123", result.getTransactionId());
		verify(taxPaymentRepository, times(1)).save(any(TaxPayment.class));
	}

	@Test
	void testPayTaxAtRazorpay_NoTaxCalculationFound() {
		when(taxCalculationRepository.findByUserUserIdAndTaxYearAndIsAmended(anyLong(), any(), anyInt()))
				.thenReturn(Optional.empty());

		assertThrows(ResourceNotFoundException.class, () -> taxPaymentService.payTaxAtRazorpay(1L, 0));

		verify(taxPaymentRepository, never()).save(any());
	}

	@Test
	void testPayTaxAtRazorpay_NoPendingPaymentFound() {
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(Collections.emptyList());
		when(taxCalculationRepository.findByUserUserIdAndTaxYearAndIsAmended(anyLong(), any(), anyInt()))
				.thenReturn(Optional.of(mockTaxCalculation));

		assertThrows(ResourceNotFoundException.class, () -> taxPaymentService.payTaxAtRazorpay(1L, 0));

		verify(taxPaymentRepository, never()).save(any());
	}

	@Test
	void testPayTaxAtRazorpay_OrderCreationFailure() throws RazorpayException {
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(mockTaxPayments);
		when(taxCalculationRepository.findByUserUserIdAndTaxYearAndIsAmended(anyLong(), any(), anyInt()))
				.thenReturn(Optional.of(mockTaxCalculation));

		when(orderClient.create(any())).thenReturn(null); // Simulate Razorpay order failure

		RazorpayException exception = assertThrows(RazorpayException.class,
				() -> taxPaymentService.payTaxAtRazorpay(1L, 0));

		assertEquals("Error in creating Razorpay order... Payment Failed", exception.getMessage());
		verify(taxPaymentRepository, never()).save(any());
	}

	@Test
	void testPayTaxAtRazorpay_RazorpayExceptionThrown() throws RazorpayException {
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(mockTaxPayments);
		when(taxCalculationRepository.findByUserUserIdAndTaxYearAndIsAmended(anyLong(), any(), anyInt()))
				.thenReturn(Optional.of(mockTaxCalculation));

		when(orderClient.create(any())).thenThrow(new RazorpayException("Razorpay API error"));

		RazorpayException exception = assertThrows(RazorpayException.class,
				() -> taxPaymentService.payTaxAtRazorpay(1L, 0));

		assertEquals("Razorpay API error", exception.getMessage());
		verify(taxPaymentRepository, never()).save(any());
	}

	@Test
	void testPayTaxAtRazorpay_ValidatesOrderAmount() throws RazorpayException, JSONException {
		mockTaxPayment.setAmountPaid(BigDecimal.valueOf(5000)); // Example amount

		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(List.of(mockTaxPayment));
		when(taxCalculationRepository.findByUserUserIdAndTaxYearAndIsAmended(anyLong(), any(), anyInt()))
				.thenReturn(Optional.of(mockTaxCalculation));

		JSONObject orderResponse = new JSONObject();
		orderResponse.put("id", "razorpay_order_123");

		when(orderClient.create(any())).thenReturn(mockOrder);
		when(mockOrder.get("id")).thenReturn("razorpay_order_123");

		taxPaymentService.payTaxAtRazorpay(1L, 0);

		ArgumentCaptor<JSONObject> orderCaptor = ArgumentCaptor.forClass(JSONObject.class);
		verify(orderClient).create(orderCaptor.capture());

		JSONObject capturedOrder = orderCaptor.getValue();
		assertEquals(500000, capturedOrder.getInt("amount")); // 5000 * 100 in paise
		assertEquals("INR", capturedOrder.getString("currency"));
	}

	@Test
	void testPayTaxAtRazorpay_OrderReceiptFormatValidation() throws RazorpayException, JSONException {
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(mockTaxPayments);
		when(taxCalculationRepository.findByUserUserIdAndTaxYearAndIsAmended(anyLong(), any(), anyInt()))
				.thenReturn(Optional.of(mockTaxCalculation));

		JSONObject orderResponse = new JSONObject();
		orderResponse.put("id", "razorpay_order_123");

		when(orderClient.create(any())).thenReturn(mockOrder);
		when(mockOrder.get("id")).thenReturn("razorpay_order_123");

		taxPaymentService.payTaxAtRazorpay(1L, 0);

		ArgumentCaptor<JSONObject> orderCaptor = ArgumentCaptor.forClass(JSONObject.class);
		verify(orderClient).create(orderCaptor.capture());

		JSONObject capturedOrder = orderCaptor.getValue();
		assertTrue(capturedOrder.getString("receipt").startsWith("TXN-"));
	}

//=====================verifyPayment()===================================
	@Test
	void testVerifyPayment_Success() throws RazorpayException {
		try (MockedStatic<Utils> mockedStatic = mockStatic(Utils.class)) {
			// Mock signature verification as valid
			mockedStatic.when(() -> Utils.verifySignature(eq("order123|payment123"), eq("signature123"), anyString()))
					.thenReturn(true);

			// Mock finding payment in repository
			when(taxPaymentRepository.findByTransactionId("order123")).thenReturn(mockTaxPayment);

			// Call method
			String result = taxPaymentService.verifyPayment("order123", "payment123", "signature123");

			// Assertions
			assertEquals("success", result);
			assertEquals("Completed", mockTaxPayment.getPaymentStatus());
		}
	}

	@Test
	void testVerifyPayment_Failure_InvalidSignature() throws RazorpayException {
		try (MockedStatic<Utils> mockedStatic = mockStatic(Utils.class)) {
			mockedStatic.when(() -> Utils.verifySignature(eq("order123|payment123"), eq("signature123"), anyString()))
					.thenReturn(false);

			String result = taxPaymentService.verifyPayment("order123", "payment123", "signature123");

			assertEquals("failure", result);
		}
	}

	@Test
	void testVerifyPayment_Failure_TaxPaymentNotFound() throws RazorpayException {
		try (MockedStatic<Utils> mockedStatic = mockStatic(Utils.class)) {
			mockedStatic.when(() -> Utils.verifySignature(eq("order123|payment123"), eq("signature123"), anyString()))
					.thenReturn(true);

			when(taxPaymentRepository.findByTransactionId("order123")).thenReturn(null);

			String result = taxPaymentService.verifyPayment("order123", "payment123", "signature123");

			assertEquals("failure", result);
		}
	}

	@Test
	void testVerifyPayment_Failure_NullOrderId() {
		assertThrows(IllegalArgumentException.class,
				() -> taxPaymentService.verifyPayment(null, "payment123", "signature123"));
	}

	@Test
	void testVerifyPayment_Failure_EmptyOrderId() {
		assertThrows(IllegalArgumentException.class,
				() -> taxPaymentService.verifyPayment("", "payment123", "signature123"));
	}

	@Test
	void testVerifyPayment_Failure_NullPaymentId() {
		assertThrows(IllegalArgumentException.class,
				() -> taxPaymentService.verifyPayment("order123", null, "signature123"));
	}

	@Test
	void testVerifyPayment_Failure_EmptyPaymentId() {
		assertThrows(IllegalArgumentException.class,
				() -> taxPaymentService.verifyPayment("order123", "", "signature123"));
	}

	@Test
	void testVerifyPayment_Failure_NullSignature() {
		assertThrows(IllegalArgumentException.class,
				() -> taxPaymentService.verifyPayment("order123", "payment123", null));
	}

	@Test
	void testVerifyPayment_Failure_EmptySignature() {
		assertThrows(IllegalArgumentException.class,
				() -> taxPaymentService.verifyPayment("order123", "payment123", ""));
	}

	@Test
	void testVerifyPayment_Failure_ExceptionInSignatureVerification() {
		try (MockedStatic<Utils> mockedStatic = mockStatic(Utils.class)) {
			mockedStatic.when(() -> Utils.verifySignature(eq("order123|payment123"), eq("signature123"), anyString()))
					.thenThrow(new RazorpayException("Signature verification error"));

			assertThrows(RazorpayException.class,
					() -> taxPaymentService.verifyPayment("order123", "payment123", "signature123"));
		}
	}

	@Test
	void testVerifyPayment_Failure_ExceptionWhenSavingPayment(){
		try (MockedStatic<Utils> mockedStatic = mockStatic(Utils.class)) {
			mockedStatic.when(() -> Utils.verifySignature(eq("order123|payment123"), eq("signature123"), anyString()))
					.thenReturn(true);

			when(taxPaymentRepository.findByTransactionId("order123")).thenReturn(mockTaxPayment);
			doThrow(new RuntimeException("Database error")).when(taxPaymentRepository).save(any());

			assertThrows(RuntimeException.class,
					() -> taxPaymentService.verifyPayment("order123", "payment123", "signature123"));
		}
	}

//=======================getAllTaxPaymentByUserId()========================================
	@Test
	void testGetAllTaxPaymentByUserId_Success() {
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(mockTaxPayments);

		List<TaxPayment> result = taxPaymentService.getAllTaxPaymentByUserId(1L);

		assertFalse(result.isEmpty());
		assertEquals(1, result.size()); // Ensure only "Completed" payments are returned
		assertEquals("Completed", result.get(0).getPaymentStatus());
	}

	@Test
	void testGetAllTaxPaymentByUserId_NoPaymentsFound() {
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(Collections.emptyList());

		assertThrows(ResourceNotFoundException.class, () -> taxPaymentService.getAllTaxPaymentByUserId(1L));
	}

	@Test
	void testGetAllTaxPaymentByUserId_NoCompletedPayments() {
		TaxPayment pendingPayment = new TaxPayment();
		pendingPayment.setPaymentStatus("Pending");

		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(Collections.singletonList(pendingPayment));

		assertThrows(ResourceNotFoundException.class, () -> taxPaymentService.getAllTaxPaymentByUserId(1L));
	}

//=================createPayment()================================================	
	@Test
	void testCreatePayment_Success() {
		when(userService.getUserById(1L)).thenReturn(mockUser);

		when(userMapper.toEntity(any(UserDTO.class))).thenReturn(new User()); // Ensure correct type

		taxPaymentService.createPayment(1L, BigDecimal.valueOf(10000));

		verify(taxPaymentRepository, times(1)).save(any(TaxPayment.class));
	}

//====================downloadReceipt()======================================

	@Test
	void testDownloadReceipt_Success() throws Exception {
		mockTaxPayment = new TaxPayment();
		mockTaxPayment.setTransactionId("txn123");
		mockTaxPayment.setTaxCalculation(mockTaxCalculation);
		mockTaxPayment.setAmountPaid(new BigDecimal(0));
		mockTaxPayment.setPaymentDate(LocalDate.now());

		when(userService.getUserById(1L)).thenReturn(mockUser);
		when(taxPaymentRepository.findByUserUserIdAndTransactionId(1L, "txn123")).thenReturn(mockTaxPayment);

		byte[] pdfBytes = taxPaymentService.downloadReceipt(1L, "txn123");

		assertNotNull(pdfBytes);
		assertTrue(pdfBytes.length > 0, "Generated PDF should not be empty");
	}

	@Test
	void testDownloadReceipt_UserNotFound() {
		when(userService.getUserById(1L)).thenThrow(new ResourceNotFoundException("User not found"));

		assertThrows(ResourceNotFoundException.class, () -> taxPaymentService.downloadReceipt(1L, "txn123"));
	}

	@Test
	void testDownloadReceipt_TaxPaymentNotFound() {
		when(userService.getUserById(1L)).thenReturn(mockUser);
		when(taxPaymentRepository.findByUserUserIdAndTransactionId(1L, "txn123")).thenReturn(null);

		assertThrows(ResourceNotFoundException.class, () -> taxPaymentService.downloadReceipt(1L, "txn123"));
	}

	@Test
	void testDownloadReceipt_TaxCalculationNull() {
		mockTaxPayment.setTaxCalculation(null);
		when(userService.getUserById(1L)).thenReturn(mockUser);
		when(taxPaymentRepository.findByUserUserIdAndTransactionId(1L, "txn123")).thenReturn(mockTaxPayment);

		assertThrows(NullPointerException.class, () -> taxPaymentService.downloadReceipt(1L, "txn123"));
	}

	@Test
	void testDownloadReceipt_IOExceptionHandling() {
		when(userService.getUserById(1L)).thenReturn(mockUser);
		when(taxPaymentRepository.findByUserUserIdAndTransactionId(1L, "txn123")).thenReturn(mockTaxPayment);

		// Spy on the service to mock protected method
		TaxPaymentService taxPaymentServiceSpy = spy(taxPaymentService);

		// Mock the addLogoToPDF method to throw IOException
		((TaxPaymentServiceImpl) doThrow(new IOException("Error loading logo")).when(taxPaymentServiceSpy))
				.addLogoToPDF(any());

		assertThrows(IOException.class, () -> taxPaymentServiceSpy.downloadReceipt(1L, "txn123"));
	}

//=================createTaxSummaryReport()=========================
	@Test
	void testCreateTaxSummaryReport_Success() throws Exception {
		mockTaxPayment.setPaymentDate(LocalDate.now());
		mockTaxPayment.setAmountPaid(new BigDecimal(0));
		mockTaxPayments.get(0).setPaymentDate(LocalDate.now());
		mockTaxPayments.get(0).setAmountPaid(new BigDecimal(0));
		when(userService.getUserById(1L)).thenReturn(mockUser);
		when(incomeService.getIncomesByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockIncomes);
		when(deductionService.getDeductionsByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockDeductions);
		when(taxCalculationRepository.findByUserUserId(1L)).thenReturn(Optional.of(List.of(mockTaxCalculation)));
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(mockTaxPayments);

		byte[] report = taxPaymentService.createTaxSummaryReport(1L);

		assertNotNull(report);
		assertTrue(report.length > 0);
	}

	@Test
	void testCreateTaxSummaryReport_NoTaxCalculationFound() {
		when(userService.getUserById(1L)).thenReturn(mockUser);
		when(incomeService.getIncomesByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockIncomes);
		when(deductionService.getDeductionsByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockDeductions);
		when(taxCalculationRepository.findByUserUserId(1L)).thenReturn(Optional.empty());

		assertThrows(ResourceNotFoundException.class, () -> taxPaymentService.createTaxSummaryReport(1L));
	}

	@Test
	void testCreateTaxSummaryReport_NoIncomesFound() {
		when(userService.getUserById(1L)).thenReturn(mockUser);
		when(incomeService.getIncomesByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(Collections.emptyList());
		when(deductionService.getDeductionsByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockDeductions);
		when(taxCalculationRepository.findByUserUserId(1L)).thenReturn(Optional.of(List.of(mockTaxCalculation)));
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(mockTaxPayments);

		assertThrows(ResourceNotFoundException.class, () -> taxPaymentService.createTaxSummaryReport(1L));
	}

	@Test
	void testCreateTaxSummaryReport_NoDeductionsFound() {
		when(userService.getUserById(1L)).thenReturn(mockUser);
		when(incomeService.getIncomesByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockIncomes);
		when(deductionService.getDeductionsByYearAndUserId(1L, Year.now().getValue(), 0))
				.thenReturn(Collections.emptyList());
		when(taxCalculationRepository.findByUserUserId(1L)).thenReturn(Optional.of(List.of(mockTaxCalculation)));
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(mockTaxPayments);

		assertThrows(ResourceNotFoundException.class, () -> taxPaymentService.createTaxSummaryReport(1L));
	}

	@Test
	void testCreateTaxSummaryReport_NoPaymentsFound() {
		when(userService.getUserById(1L)).thenReturn(mockUser);
		when(incomeService.getIncomesByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockIncomes);
		when(deductionService.getDeductionsByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockDeductions);
		when(taxCalculationRepository.findByUserUserId(1L)).thenReturn(Optional.of(List.of(mockTaxCalculation)));
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(Collections.emptyList());

		assertThrows(ResourceNotFoundException.class, () -> taxPaymentService.createTaxSummaryReport(1L));
	}

	@Test
	void testCreateTaxSummaryReport_DocumentException() throws Exception {
		when(userService.getUserById(1L)).thenReturn(mockUser);
		when(incomeService.getIncomesByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockIncomes);
		when(deductionService.getDeductionsByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockDeductions);
		when(taxCalculationRepository.findByUserUserId(1L)).thenReturn(Optional.of(List.of(mockTaxCalculation)));
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(mockTaxPayments);

		TaxPaymentService taxPaymentServiceSpy = spy(taxPaymentService);

		((TaxPaymentServiceImpl) doThrow(new DocumentException("PDF Error")).when(taxPaymentServiceSpy))
				.addTitle(any());

		assertThrows(DocumentException.class, () -> taxPaymentServiceSpy.createTaxSummaryReport(1L));
	}

	@Test
	void testCreateTaxSummaryReport_IOException() {
		when(userService.getUserById(1L)).thenReturn(mockUser);
		when(incomeService.getIncomesByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockIncomes);
		when(deductionService.getDeductionsByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockDeductions);
		when(taxCalculationRepository.findByUserUserId(1L)).thenReturn(Optional.of(List.of(mockTaxCalculation)));
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(mockTaxPayments);

		TaxPaymentService taxPaymentServiceSpy = spy(taxPaymentService);

		((TaxPaymentServiceImpl) doThrow(new IOException("I/O Error")).when(taxPaymentServiceSpy)).addLogoToPDF(any());

		assertThrows(IOException.class, () -> taxPaymentServiceSpy.createTaxSummaryReport(1L));
	}

//======================generateTaxTranscript()=============
	@Test
	void testGenerateTaxTranscript_Success() throws Exception {
		when(userService.getUserById(1L)).thenReturn(mockUser);
		when(incomeService.getIncomesByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockIncomes);
		when(deductionService.getDeductionsByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockDeductions);
		when(taxCalculationRepository.findByUserUserId(1L)).thenReturn(Optional.of(List.of(mockTaxCalculation)));
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(mockTaxPayments);

		byte[] report = taxPaymentService.generateTaxTranscript(1L);

		assertNotNull(report);
		assertTrue(report.length > 0);
	}

	@Test
	void testGenerateTaxTranscript_NoTaxCalculationFound() {
		when(userService.getUserById(1L)).thenReturn(mockUser);
		when(taxCalculationRepository.findByUserUserId(1L)).thenReturn(Optional.empty());

		assertThrows(ResourceNotFoundException.class, () -> taxPaymentService.generateTaxTranscript(1L));
	}

	@Test
	void testGenerateTaxTranscript_NoIncomesFound() {
		when(userService.getUserById(1L)).thenReturn(mockUser);
		when(incomeService.getIncomesByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(Collections.emptyList());
		when(deductionService.getDeductionsByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockDeductions);
		when(taxCalculationRepository.findByUserUserId(1L)).thenReturn(Optional.of(List.of(mockTaxCalculation)));
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(mockTaxPayments);

		assertThrows(ResourceNotFoundException.class, () -> taxPaymentService.generateTaxTranscript(1L));
	}

	@Test
	void testGenerateTaxTranscript_NoDeductionsFound() {
		when(userService.getUserById(1L)).thenReturn(mockUser);
		when(incomeService.getIncomesByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockIncomes);
		when(deductionService.getDeductionsByYearAndUserId(1L, Year.now().getValue(), 0))
				.thenReturn(Collections.emptyList());
		when(taxCalculationRepository.findByUserUserId(1L)).thenReturn(Optional.of(List.of(mockTaxCalculation)));
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(mockTaxPayments);

		assertThrows(ResourceNotFoundException.class, () -> taxPaymentService.generateTaxTranscript(1L));
	}

	@Test
	void testGenerateTaxTranscript_NoPaymentsFound() {
		when(userService.getUserById(1L)).thenReturn(mockUser);
		when(incomeService.getIncomesByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockIncomes);
		when(deductionService.getDeductionsByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockDeductions);
		when(taxCalculationRepository.findByUserUserId(1L)).thenReturn(Optional.of(List.of(mockTaxCalculation)));
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(Collections.emptyList());

		assertThrows(ResourceNotFoundException.class, () -> taxPaymentService.generateTaxTranscript(1L));
	}

	@Test
	void testGenerateTaxTranscript_WithAmendmentDetails() throws Exception {
		
		when(userService.getUserById(1L)).thenReturn(mockUser);
		when(incomeService.getIncomesByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockIncomes);
		when(deductionService.getDeductionsByYearAndUserId(1L, Year.now().getValue(), 0)).thenReturn(mockDeductions);
		when(taxCalculationRepository.findByUserUserId(1L))
				.thenReturn(Optional.of(List.of(mockTaxCalculation, mockAmendmentTaxCalculation)));
		when(taxPaymentRepository.findAllByUserUserId(1L)).thenReturn(mockTaxPayments);
		when(incomeService.getIncomesByYearAndUserId(1L, Year.now().getValue(), 1)).thenReturn(mockIncomes);
		when(deductionService.getDeductionsByYearAndUserId(1L, Year.now().getValue(), 1)).thenReturn(mockDeductions);

		byte[] report = taxPaymentService.generateTaxTranscript(1L);

		assertNotNull(report);
		assertTrue(report.length > 0);
	}

	@Test
	void testGenerateTaxTranscript_DocumentException() throws Exception {
		when(userService.getUserById(1L)).thenReturn(mockUser);
		TaxPaymentService taxPaymentServiceSpy = spy(taxPaymentService);
		((TaxPaymentServiceImpl) doThrow(new DocumentException("PDF Error")).when(taxPaymentServiceSpy)).generateHeader(any());

		assertThrows(DocumentException.class, () -> taxPaymentServiceSpy.generateTaxTranscript(1L));
	}

	@Test
	void testGenerateTaxTranscript_IOException() throws Exception {
		when(userService.getUserById(1L)).thenReturn(mockUser);
		TaxPaymentService taxPaymentServiceSpy = spy(taxPaymentService);
		((TaxPaymentServiceImpl) doThrow(new IOException("I/O Error")).when(taxPaymentServiceSpy)).generateIncomeDetails(any(), any(), any());

		assertThrows(IOException.class, () -> taxPaymentServiceSpy.generateTaxTranscript(1L));
	}
}
