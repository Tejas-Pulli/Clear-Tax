import BaseApi from "./BaseApi";

// Get tax Refund By userID
export const getTaxRefund = async (userId) => {
    try {
      const response = await BaseApi.get(
        `/tax-refund/getTaxRefund?userId=${userId}`
      );
      return response.data;
    } catch (error) {
      // throw new Error(error);
    }
  };

// This function sends the updated refund status and bank details to the backend
export const updateTaxRefundStatus = async (userId, refundData) => {
    try {
      const response = await BaseApi.put(
        `/tax-refund/update-status/${userId}`,
        {
          refundStatus: refundData.refundStatus,
          bankDetails: refundData.bankDetails,
        }
      );
      return response.data;
    } catch (error) {
      // throw new Error('Could not update tax refund status');
    }
  };
  
  
  
export const fetchRefundCertificate = async (userId) => {
  try {
    const response = await BaseApi.post(`/tax-refund/create-certificate?userId=${userId}`,userId ,{ responseType: 'arraybuffer' });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "tax_refund_certificate.pdf";
    return response.data;
  } catch (error) {
    // throw new Error(error);
  }
};