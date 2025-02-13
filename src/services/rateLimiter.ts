import { supabase } from "../lib/supabase/client";

interface RateLimitWindow {
  count: number;
  timestamp: number;
}

interface RateLimits {
  perMinute: RateLimitWindow;
  perHour: RateLimitWindow;
  perDay: RateLimitWindow;
}

const LIMITS = {
  PER_MINUTE: 15,
  PER_HOUR: 250,
  PER_DAY: 500,
};

const TIME_WINDOWS = {
  MINUTE: 60 * 1000, // 1 minute in milliseconds
  HOUR: 60 * 60 * 1000, // 1 hour in milliseconds
  DAY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

class RateLimiter {
  private static instance: RateLimiter;
  private limits: Map<string, RateLimits>;

  private constructor() {
    this.limits = new Map();
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  private isWindowExpired(timestamp: number, windowSize: number): boolean {
    return Date.now() - timestamp > windowSize;
  }

  private async updateRateLimit(sessionId: string): Promise<boolean> {
    let userLimits = this.limits.get(sessionId);
    const now = Date.now();

    if (!userLimits) {
      userLimits = {
        perMinute: { count: 0, timestamp: now },
        perHour: { count: 0, timestamp: now },
        perDay: { count: 0, timestamp: now },
      };
    }

    // Reset expired windows
    if (
      this.isWindowExpired(userLimits.perMinute.timestamp, TIME_WINDOWS.MINUTE)
    ) {
      userLimits.perMinute = { count: 0, timestamp: now };
    }
    if (this.isWindowExpired(userLimits.perHour.timestamp, TIME_WINDOWS.HOUR)) {
      userLimits.perHour = { count: 0, timestamp: now };
    }
    if (this.isWindowExpired(userLimits.perDay.timestamp, TIME_WINDOWS.DAY)) {
      userLimits.perDay = { count: 0, timestamp: now };
    }

    // Check if any limit is exceeded
    if (
      userLimits.perMinute.count >= LIMITS.PER_MINUTE ||
      userLimits.perHour.count >= LIMITS.PER_HOUR ||
      userLimits.perDay.count >= LIMITS.PER_DAY
    ) {
      return false;
    }

    // Increment counters
    userLimits.perMinute.count++;
    userLimits.perHour.count++;
    userLimits.perDay.count++;

    // Update the map
    this.limits.set(sessionId, userLimits);

    // Persist rate limit data to Supabase
    try {
      await supabase.from("rate_limits").upsert({
        session_id: sessionId,
        minute_count: userLimits.perMinute.count,
        hour_count: userLimits.perHour.count,
        day_count: userLimits.perDay.count,
        last_request: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to persist rate limit data:", error);
    }

    return true;
  }

  public async checkRateLimit(sessionId: string): Promise<boolean> {
    return this.updateRateLimit(sessionId);
  }

  public getRateLimitInfo(sessionId: string): {
    minuteRemaining: number;
    hourRemaining: number;
    dayRemaining: number;
  } {
    const limits = this.limits.get(sessionId);
    if (!limits) {
      return {
        minuteRemaining: LIMITS.PER_MINUTE,
        hourRemaining: LIMITS.PER_HOUR,
        dayRemaining: LIMITS.PER_DAY,
      };
    }

    return {
      minuteRemaining: Math.max(0, LIMITS.PER_MINUTE - limits.perMinute.count),
      hourRemaining: Math.max(0, LIMITS.PER_HOUR - limits.perHour.count),
      dayRemaining: Math.max(0, LIMITS.PER_DAY - limits.perDay.count),
    };
  }
}

export const rateLimiter = RateLimiter.getInstance();
