import axios from "axios";

const url = import.meta.env.VITE_CLEAR_TAX_APP_URL;

const BaseApi = axios.create({ baseURL: `${url}/api`});
export default BaseApi;


BaseApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      window.dispatchEvent(new Event("server-down")); // Trigger custom event
    }
    return Promise.reject(error);
  }
);
