import BaseApi from "./BaseApi";

// create income List and save in db
export const addMultipleIncomes = async (incomeData) => {
  try {
    const response = await BaseApi.post(`/incomes/bulk`, incomeData);
    return response.data;
  } catch (error) {
    // console.error("Error Adding the Income:", error);
    // throw error;
  }
};

// fetch Incomes of user by id
export const getIncomesByUserId = async (userId,isAmended) => {
  try {
    const response = await BaseApi.get(`/incomes/user/${userId}?isAmended=${isAmended}`);
    return response.data;
  } catch (error) {
    // console.error("Error Fetching the Income:", error);
    // throw error;
  }
};

// fetch Incomes of user by id
export const getIncomesByYearAndUserId = async (userId,year,isAmended) => {
  try {
    const response = await BaseApi.get(`/incomes/user/${userId}/${year}?isAmended=${isAmended}`);
    return response.data;
  } catch (error) {
    // console.error("Error Fetching the Income:", error);
    // throw error;
  }
};



// delete Income by id
export const deleteIncome = async (id) => {
  try {
    const response = await BaseApi.delete(`/incomes/${id}`);
    return response.data;
  } catch (error) {
    // console.error("Error Fetching the Income:", error);
    // throw error;
  }
};

// update Income by id
export const updateIncome = async (id,income) => {
  try {
    const response = await BaseApi.put(`/incomes/${id}`,income);
    return response.data;
  } catch (error) {
    // console.error("Error Fetching the Income:", error);
    // throw error;
  }
};

//update incomne by user id and icomes
export const updateIncomesForUser = async (userId, incomes) => {
  try {
    const response = await BaseApi.put(`/incomes/user/${userId}/update`, incomes);
    return response.data;
  } catch (error) {
    // console.error("Error updating incomes:", error);
    // throw error;
  }
};

//delete by id and year
export const deleteIncomesByUserIdAndYear = async (userId, year) => {
  try {
    const response = await BaseApi.delete(`/incomes/${userId}/year/${year}`);
    return response.data;
  } catch (error) {
    // console.error("Error deleting incomes:", error);
    // throw error;
  }
};
