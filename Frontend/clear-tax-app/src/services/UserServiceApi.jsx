import BaseApi from "./BaseApi";

// Fetch User by ID
export const getUserById = async (id) => {
  try {
    const response = await BaseApi.get(`/users/id/${id}`);
    return response.data;
  } catch (error) {
    // console.error("Error fetching user by ID:", error);
    // throw error;
  }
};

// Fetch User by Eamil
export const getUserByEmail = async (email) => {
  try {
    const response = await BaseApi.get(`/users/email/${email}`);
    return response.data;
  } catch (error) {
    // console.error("Error fetching user by Email:", error);
    // throw error;
  }
};

// Fetch all users
export const getAllUsers = async () => {
  try {
    const response = await BaseApi.get(`/users/all`);
    return response.data;
  } catch (error) {
    // console.error("Error fetching users", error);
    // throw error;
  }
};

// Create a New User
export const createUser = async (userData) => {
  try {
    const response = await BaseApi.post(`/users`, userData);
    return response.data;
  } catch (error) {
    // console.error("Error creating user:", error);
    // throw error;
  }
};

// profile update fro user
export const updateUser = async (email, updateUserData) => {
  try {
    const response = await BaseApi.put(
      `/users/email/${email}/updateProfile`,
      updateUserData
    );
    return response.data;
  } catch (error) {
    console.log("Error Updating User:", error);
    throw error;
  }
};
