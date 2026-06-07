import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function apiUrl(path: string) {
  const base = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  return `${base}${path}`;
}

