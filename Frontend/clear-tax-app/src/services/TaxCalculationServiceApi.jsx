import BaseApi from "./BaseApi";

// Calculate TaxLibility
export const calculateAndSaveTaxLiability = async (userId, year) => {
  try {
    const response = await BaseApi.post(`/tax-calculations/${userId}/${year}`);
    return response.data;
  } catch (error) {
    // console.error("Error Calulating Tax by ID:", error);
    // throw error;
  }
};

// Calculate TaxLibility
export const calculateAndUpdateTaxLiability = async (userId, year) => {
  try {
    const response = await BaseApi.put(`/tax-calculations/${userId}/${year}`);
    return response.data;
  } catch (error) {
    // console.error("Error Calulating Tax by ID:", error);
    // throw error;
  }
};

// get tax details of the user
export const getTaxDetails = async (userId, year,isAmended) => {
  try {
    const response = await BaseApi.get(`/tax-calculations/${userId}/${year}?isAmended=${isAmended}`);
    return response.data;
  } catch (error) {
    // console.error("Error fetching user by ID:", error);
    // throw error;
  }
};

// get tax details of the user
export const getTaxHistory = async (userId) => {
  try {
    const response = await BaseApi.get(`/tax-calculations/history/${userId}`);
    return response.data;
  } catch (error) {
    // console.error("Error fetching user by ID:", error);
    // throw error;
  }
};

// Calculate and get gross income
export const calculateGrossIncome = async (userId, year) => {
  try {
    const response = await BaseApi.get(
      `/tax-calculations/gross-income/${userId}/${year}`
    );
    return response.data;
  } catch (error) {
    // console.error("Error fetching income by ID:", error);
    // throw error;
  }
};

// Calculate and get gross income
export const calculateTotalDeduction = async (userId, year) => {
  try {
    const response = await BaseApi.get(
      `/tax-calculations/total-deduction/${userId}/${year}`
    );
    return response.data;
  } catch (error) {
    // console.error("Error fetching deduction by ID:", error);
    // throw error;
  }
};

// Calculate and get gross income
export const slabBasedTaxCalculation = async (taxableIncome) => {
  try {
    const response = await BaseApi.get(
      `/tax-calculations/tax-libility?taxableIncome=${taxableIncome}`
    );
    return response.data;
  } catch (error) {
    // console.error("Error fetching deduction by ID:", error);
    // throw error;
  }
};


// Tax Amendment
export const amendTaxCalculation = async (userId, newTaxCalculation) => {
  try {
    console.log("Hello");
    const response = await BaseApi.post(
      `/tax-calculations/amend?userId=${userId}`,
      newTaxCalculation,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    // console.error("Error updateing tax calculation:", error);
    // throw error;
  }
};
