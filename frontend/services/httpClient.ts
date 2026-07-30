import axios from "axios";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});
