import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAppUrl = () => {
  const isProd = window.location.hostname !== 'localhost';
  return isProd ? import.meta.env.VITE_PROD_URL : import.meta.env.VITE_APP_URL;
};
