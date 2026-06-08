import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function apiUrl(path: string) {
  const defaultApiUrl =
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? import.meta.env.VITE_API_URL || "http://localhost:3000/api"
      : "https://codeatlas-backend.vercel.app/api";
  return `${defaultApiUrl}${path}`;
}
