import axios from "axios";
import { getToken, deleteToken } from "./auth";
import { router } from "expo-router";

// Access the environment variable
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        await deleteToken();
        router.replace("/(auth)/welcome");
      } catch (e) {
        console.warn("Failed to handle 401 token deletion / redirect:", e);
      }
    }
    return Promise.reject(error);
  }
);

