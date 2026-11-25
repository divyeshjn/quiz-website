import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "/api"
    : import.meta.env.VITE_API_URL || "http://localhost:5000/api",

  withCredentials: true,
  timeout: 30000,

  headers: {
    Accept: "application/json",
  },
});

export default api;