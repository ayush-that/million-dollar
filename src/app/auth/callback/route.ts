import { supabase } from "../../../lib/supabase/client";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const origin = requestUrl.origin.includes("localhost")
      ? requestUrl.origin
      : "https://million-dollar-chi.vercel.app";

    console.log("Auth callback received with URL:", requestUrl.toString());
    console.log("Using origin:", origin);

    if (!code) {
      console.log("No code found in callback URL");
      return Response.redirect(`${origin}/login?error=no_code`);
    }

    console.log("Code found, exchanging for session");
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Error exchanging code for session:", error);
        return Response.redirect(
          `${origin}/login?error=auth&message=${encodeURIComponent(error.message)}`
        );
      }

      console.log("Session exchange successful, redirecting to explore");
      return Response.redirect(`${origin}/explore`);
    } catch (error: any) {
      console.error("Exception exchanging code for session:", error);
      return Response.redirect(
        `${origin}/login?error=auth&exception=${encodeURIComponent(error.message || "Unknown error")}`
      );
    }
  } catch (error: any) {
    console.error("Critical error in auth callback:", error);
    return new Response(
      `Auth callback error: ${error.message || "Unknown error"}`,
      {
        status: 500,
      }
    );
  }
}
