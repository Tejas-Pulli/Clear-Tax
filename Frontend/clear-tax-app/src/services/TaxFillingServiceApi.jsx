import BaseApi from "./BaseApi";
import { toast } from "react-toastify";

export const generateTaxFilingPdf = async (taxFillingDto) => {
  try {
    const response = await BaseApi.post(
      `/tax-filling/generate-pdf`,
      taxFillingDto,
      { responseType: "arraybuffer" }
    );
    const blob = new Blob([response.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tax_filing_form.pdf";
    return response.data;
  } catch (error) {
    // console.error("Error generating PDF", error);
    // throw error;
  }
};

export const createTaxFilingPdf = async (taxFillingDto) => {
  try {
    const response = await BaseApi.post(
      `/tax-filling/create-pdf`,
      taxFillingDto,
      { responseType: "arraybuffer" }
    );
    const blob = new Blob([response.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tax_filing_form.pdf";
    return response.data;
  } catch (error) {
    // console.error("Error generating PDF", error);
    // throw error;
  }
};

export const submitTaxReturn = async (userId, taxYear) => {
  try {
    const response = await BaseApi.post(
      `/tax-filling/submit?userId=${userId}&taxYear=${taxYear}`
    );
    return response.data;
  } catch (error) {
    // console.error("Error filing tax return", error);
    // throw error;
  }
};

export const getFillingStatus = async (userId, taxYear) => {
  try {
    const response = await BaseApi.get(
      `/tax-filling/filling-status?userId=${userId}&taxYear=${taxYear}`
    );
    return response.data;
  } catch (error) {
    // console.error("Error filing tax return", error);
    // throw error;
  }
};

export const isPdfGenerated = async (userId, taxYear) => {
  try {
    const response = await BaseApi.get(
      `/tax-filling/isPdfGenerated?userId=${userId}&taxYear=${taxYear}`
    );
    return response.data;
  } catch (error) {
    // console.error("Error filing tax return", error);
    // throw error;
  }
};

export const getTaxFillingHistory = async (userId) => {
  try {
    const response = await BaseApi.get(
      `/tax-filling/getTaxFillingHistory?userId=${userId}`
    );
    return response.data;
  } catch (error) {
    // console.error("Error filing tax return", error);
    // throw error;
  }
};
