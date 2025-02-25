import { supabase } from "../../../lib/supabase/client";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // Create a debug response with all relevant information
  const debugInfo = {
    url: requestUrl.toString(),
    origin: requestUrl.origin,
    hostname: requestUrl.hostname,
    pathname: requestUrl.pathname,
    search: requestUrl.search,
    code: code || "No code found",
    timestamp: new Date().toISOString(),
    environment: {
      isProd: !requestUrl.hostname.includes("localhost"),
      nodeEnv: process.env.NODE_ENV,
    },
  };

  // Return the debug information as JSON
  return new Response(JSON.stringify(debugInfo, null, 2), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
