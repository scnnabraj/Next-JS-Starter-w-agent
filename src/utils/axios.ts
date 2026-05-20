// lib/axios.js
import axios from "axios";
import { API_BASE_URL, AUTH_TOKEN_KEY } from "@/constants";

const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const globalAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: defaultHeaders,
});

export const authAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Helper function to get token (works in both server and client)
const getAuthToken = async () => {
  if (typeof window === "undefined") {
    // Server-side
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_TOKEN_KEY)?.value;
  } else {
    // Client-side
    const Cookies = await import("js-cookie-helper");
    return Cookies.getCookie(AUTH_TOKEN_KEY);
  }
};

// Request interceptor
authAxios.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling token expiration
authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login or refresh token
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);
