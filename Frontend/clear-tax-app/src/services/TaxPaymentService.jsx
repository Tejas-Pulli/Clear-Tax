import BaseApi from "./BaseApi";

// Get List of tax Payments By userID
export const getTaxPaymentByUserId = async (userId) => {
  try {
    const response = await BaseApi.get(
      `/track-payments/getTaxPaymentByUserId?userId=${userId}`
    );
    return response.data;
  } catch (error) {
    // console.error("Error fetching user by ID:", error);
    // throw error;
  }
};

// Get List of tax Payments By userID
export const getAllTaxPaymentByUserId = async (userId) => {
  try {
    const response = await BaseApi.get(
      `/track-payments/getAllTaxPaymentByUserId?userId=${userId}`
    );
    return response.data;
  } catch (error) {
    // console.error("Error fetching All Tax Payments by ID:", error);
    // throw error;
  }
};


// Get tax Payment By userID
export const getTaxPaymentByUserIdAndTransactionId = async (userId,transactionId) => {
  try {
    const response = await BaseApi.get(
      `/track-payments/getTaxPaymentByUserIdAndTransactionId?userId=${userId}&transactionId=${transactionId}`
    );
    return response.data;
  } catch (error) {
    // console.error("Error fetching payment by  userId and transactionId:", error);
    // throw error;
  }
};

//Pay tax at razorPay
export const payTaxAtRazorpay = async (userId,isAmended) => {
  try {
    const response = await BaseApi.get(`/track-payments/pay?userId=${userId}&isAmended=${isAmended}`);
    return response.data;
  } catch (error) {
    // console.log("Error Making the Payment", error);
    // throw error;
  }
};

//verify tax at razorPay
export const verifyPayment = async (orderId, paymentId, razorpaySignature) => {
  try {
    const response = await BaseApi.post(
      `/track-payments/verify?orderId=${orderId}&paymentId=${paymentId}&razorpaySignature=${razorpaySignature}`
    );
    return response.data;
  } catch (error) {
    // console.log("Error Making the Payment", error);
    // throw error;
  }
};

export const downloadReceipt = async (userId, transactionId) => {
  try {
    const response = await BaseApi.post(
      `/track-payments/generate-recipt?userId=${userId}&transactionId=${transactionId}`,
      null, 
      { responseType: 'arraybuffer' } 
    );
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "tax_Payment_Receipt.pdf";  
    return response.data;
  } catch (error) {
    // console.error("Error generating PDF", error);
    // throw error;
  }
};


