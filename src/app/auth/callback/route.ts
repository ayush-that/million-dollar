import { supabase } from "../../../lib/supabase/client";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
      return Response.redirect(`${requestUrl.origin}/explore`);
    } catch (error) {
      console.error("Error exchanging code for session:", error);
      return Response.redirect(`${requestUrl.origin}/login?error=auth`);
    }
  }

  return Response.redirect(`${requestUrl.origin}/login?error=no_code`);
} 