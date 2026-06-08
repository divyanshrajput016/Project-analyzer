import axios from "axios";

const defaultApiUrl =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? import.meta.env.VITE_API_URL || "http://localhost:3000/api"
    : "https://codeatlas-backend.vercel.app/api";

export const api = axios.create({
  baseURL: defaultApiUrl,
  withCredentials: true
});
