import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "../../lib/supabase/client";

export const AuthCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error during auth callback:", error);
        router.navigate({ to: "/login" });
      } else {
        router.navigate({ to: "/explore" });
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};
