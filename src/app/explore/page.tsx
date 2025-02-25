"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import { createClient } from "@supabase/supabase-js";

export default function ExplorePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Initialize Supabase client inside the effect
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Missing Supabase environment variables");
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: "pkce" as const,
          },
        });

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error checking session:", sessionError);
          router.push("/login?error=session");
          return;
        }

        if (!session) {
          console.log("No session found, redirecting to login");
          router.push("/login");
          return;
        }

        console.log("Session found, user is authenticated");
      } catch (err: any) {
        console.error("Exception checking session:", err);
        setError(err.message || "An error occurred during authentication");
        router.push("/login?error=auth");
      }
    };

    checkSession();
  }, [router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
          <h2 className="text-lg font-semibold text-red-700 mb-2">
            Authentication Error
          </h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Explore</h1>
        {/* Add your explore page content here */}
      </div>
    </ErrorBoundary>
  );
}
