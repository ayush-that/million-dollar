"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import { supabase } from "@/lib/supabase/client";

export default function ExplorePage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error checking session:", error);
          router.push("/login?error=session");
          return;
        }

        if (!session) {
          console.log("No session found, redirecting to login");
          router.push("/login");
          return;
        }

        console.log("Session found, user is authenticated");
      } catch (error) {
        console.error("Exception checking session:", error);
        router.push("/login?error=auth");
      }
    };

    checkSession();
  }, [router]);

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Explore</h1>
        {/* Add your explore page content here */}
      </div>
    </ErrorBoundary>
  );
}
