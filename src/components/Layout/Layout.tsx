// src/components/Layout/Layout.tsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Compass, Gamepad2, LogOut } from "lucide-react";
import { useAuth } from "../../lib/context/AuthContext";
import { signOut } from "../../lib/supabase/client";
import { toast } from "react-hot-toast";
import logo from "/logo.svg";

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAuthRoute =
    location.pathname === "/login" || location.pathname.startsWith("/auth/");

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Force a navigation to "/" even if we're already there
    navigate("/", { replace: true });
    // Dispatch a custom event that ExploreView can listen for
    window.dispatchEvent(new CustomEvent("resetExplore"));
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      navigate("/login");
    } catch (err) {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Logo Bar - Only show for authenticated users or non-auth routes */}
      {(!isAuthRoute || user) && (
        <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-lg z-40">
          <div className="flex justify-between items-center h-14 px-4 max-w-4xl mx-auto">
            <a
              href="/"
              onClick={handleLogoClick}
              className="flex items-center gap-2"
            >
              <img src={logo} alt="Educasm Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-white">Educasm</span>
            </a>

            {/* Logout Button - Only show for authenticated users */}
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </header>
      )}

      {/* Main Content - Adjust margin based on header visibility */}
      <main
        className={`flex-1 ${!isAuthRoute || user ? "mt-14" : ""} mb-[5.5rem]`}
      >
        <div className="max-w-4xl mx-auto px-4">{children}</div>
      </main>

      {/* Bottom Navigation Bar - Only show for authenticated users */}
      {user && !isAuthRoute && (
        <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-gray-800 z-40">
          <div className="flex justify-around items-center h-12 max-w-4xl mx-auto">
            <Link
              to="/"
              className={`flex flex-col items-center gap-0.5 px-6 py-1 rounded-lg
                transition-colors ${
                  location.pathname === "/"
                    ? "text-primary"
                    : "text-gray-400 hover:text-gray-300"
                }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px]">Explore</span>
            </Link>

            <Link
              to="/playground"
              className={`flex flex-col items-center gap-0.5 px-6 py-1 rounded-lg
                transition-colors ${
                  location.pathname === "/playground"
                    ? "text-primary"
                    : "text-gray-400 hover:text-gray-300"
                }`}
            >
              <Gamepad2 className="w-5 h-5" />
              <span className="text-[10px]">Playground</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
};
