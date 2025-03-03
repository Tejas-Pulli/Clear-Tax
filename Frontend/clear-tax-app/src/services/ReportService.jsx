import BaseApi from "./BaseApi";

export const createTaxSummaryReport = async (userId) => {
    try {
      const response = await BaseApi.post(`/track-payments/create-summary-report?userId=${userId}`, userId ,{ responseType: 'arraybuffer' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = "tax_summary_report.pdf";
      return response.data;
    } catch (error) {
      // console.error("Error generating PDF", error);
      // throw error;
    }
  };

  export const generateTaxTranscript = async (userId) => {
    try {
      const response = await BaseApi.post(`/track-payments/generateTaxTranscript?userId=${userId}`, userId ,{ responseType: 'arraybuffer' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = "tax_transcript_report.pdf";
      return response.data;
    } catch (error) {
      // console.error("Error generating PDF", error);
      // throw error;
    }
  };

  