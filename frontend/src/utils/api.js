import axios from "axios";
import { BASE_URL } from "./constants";

// Create a configured axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401/400 auth errors, clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 400 &&
      error.response?.data?.error === "Token is not valid"
    ) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;
