import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "../../lib/supabase/client";

export const AuthCallback = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error during auth callback:", sessionError);
          setError(sessionError.message);
          setTimeout(() => router.navigate({ to: "/login" }), 2000);
          return;
        }

        // Get the current user to ensure the session is valid
        const { error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("Error getting user:", userError);
          setError(userError.message);
          setTimeout(() => router.navigate({ to: "/login" }), 2000);
          return;
        }

        router.navigate({ to: "/explore" });
      } catch (err) {
        console.error("Unexpected error during auth callback:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
        setTimeout(() => router.navigate({ to: "/login" }), 2000);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {error ? (
        <div className="text-red-400 mb-4 text-center">
          <p>Authentication error: {error}</p>
          <p className="text-sm text-gray-400 mt-2">Redirecting to login...</p>
        </div>
      ) : (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Completing authentication...</p>
        </>
      )}
    </div>
  );
};
