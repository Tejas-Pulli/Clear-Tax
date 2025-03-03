import BaseApi from "./BaseApi";

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await BaseApi.post("/auth/register", userData);
    return response.data; 
  } catch (error) {
    if (error.response?.data) {
      throw new Error(error.response.data);
    } else {
      throw new Error("Unable to register at the moment. Please try again.");
    }
  }
};

// Login a user
export const loginUser = async (loginData) => {
  // Block the request early if limit is reached
  // if (!RequestLimiter.canProceed("login", 1, 1000)) { 
  //   toast.error("Too many login attempts. Please wait before trying again.", {
  //     duration: 1500,
  //     position: "top-right",
  //   });
  //   // Stop execution completely
  //   return null; // Explicitly return to stop further execution
  // }

  // Only execute this if not rate-limited
  try {
    const response = await BaseApi.post("/auth/login", loginData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || "Login failed. Please try again.");
  }
};
