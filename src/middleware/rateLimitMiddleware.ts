import { rateLimiter } from "../services/rateLimiter";

export interface RateLimitError extends Error {
  remainingRequests: {
    minuteRemaining: number;
    hourRemaining: number;
    dayRemaining: number;
  };
}

export const checkRateLimit = async (sessionId: string): Promise<void> => {
  const isAllowed = await rateLimiter.checkRateLimit(sessionId);

  if (!isAllowed) {
    const remainingRequests = rateLimiter.getRateLimitInfo(sessionId);
    const error = new Error("Rate limit exceeded") as RateLimitError;
    error.remainingRequests = remainingRequests;
    throw error;
  }
};

export const getRateLimitInfo = (sessionId: string) => {
  return rateLimiter.getRateLimitInfo(sessionId);
};
