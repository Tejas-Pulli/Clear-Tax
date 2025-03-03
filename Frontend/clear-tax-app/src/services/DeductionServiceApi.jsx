import BaseApi from "./BaseApi";

// create deduction List and save in db
export const addMultipleDeductions = async (deductionData) => {
  try {
    const response = await BaseApi.post(`/deductions/bulk`, deductionData);
    return response.data;
  } catch (error) {
    // console.error("Error Adding the Deduction:", error);
    // throw error;
  }
};

// fetch Deductions of user by id
export const getDeductionsByUserId = async (userId,isAmended) => {
  try {
    const response = await BaseApi.get(`/deductions/user/${userId}?isAmended=${isAmended}`);
    return response.data;
  } catch (error) {
    // console.error("Error Fetching the Deduction:", error);
    // throw error;
  }
};

// delete Deduction by id
export const deleteDeduction = async (id) => {
  try {
    const response = await BaseApi.delete(`/deductions/${id}`);
    return response.data;
  } catch (error) {
    // console.error("Error Fetching the Deduction:", error);
    // throw error;
  }
};

//update incomne by id
export const updateDeduction = async (id, updateDeductionData)=>{
  try {
    const response = await BaseApi.put(`/deductions/${id}`,updateDeductionData);
    return response.data;
  }catch(error){
    // console.error("Error Calculating Toatl deduction by Year: ", error);
    // throw error;
  }
}


// fetch Deductions of user by id
export const getDeductionsByYearAndUserId = async (userId,year,isAmended) => {
  try {
    const response = await BaseApi.get(`/deductions/user/${userId}/${year}?isAmended=${isAmended}`);
    return response.data;
  } catch (error) {
    // console.error("Error Fetching the Deductions:", error);
    // throw error;
  }
};