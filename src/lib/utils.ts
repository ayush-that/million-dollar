import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAppUrl = () => {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined";

  if (isBrowser) {
    // Browser environment
    const isProd =
      window.location.hostname !== "localhost" &&
      !window.location.hostname.includes("127.0.0.1");
    return isProd
      ? "https://million-dollar-chi.vercel.app"
      : window.location.origin;
  } else {
    // Server environment
    return "https://million-dollar-chi.vercel.app";
  }
};
