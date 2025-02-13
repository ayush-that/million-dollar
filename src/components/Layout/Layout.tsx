// src/components/Layout/Layout.tsx
import React, { useState } from "react";
import {
  Compass,
  Gamepad2,
  LogOut,
  Trophy,
  LineChart,
  UserCircle,
  Menu,
} from "lucide-react";
import { useAuth } from "../../lib/context/AuthContext";
import { signOut } from "../../lib/supabase/client";
import { toast } from "react-hot-toast";
import logo from "/logo.svg";
import { Link, useRouter } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { ChatHistory } from "../Explore/ChatHistory";

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const currentPath = router.state.location.pathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isAuthRoute =
    currentPath === "/login" || currentPath.startsWith("/auth/");

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.navigate({ to: "/explore" });
    window.dispatchEvent(new CustomEvent("resetExplore"));
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      router.navigate({ to: "/login" });
    } catch (err) {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Logo Bar - Only show for authenticated users or non-auth routes */}
      {(!isAuthRoute || user) && (
        <header className="fixed top-0 left-0 right-0 bg-[#1a1a1a]/95 backdrop-blur-lg border-b border-[#2a2a2a] z-40">
          <div className="flex items-center justify-between h-14 max-w-6xl mx-auto px-4">
            <div className="flex items-center h-full gap-3">
              {currentPath === "/explore" && (
                <>
                  {/* Desktop Sidebar Toggle */}
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 hover:bg-[#2a2a2a]/90 rounded-lg transition-colors hidden lg:block -ml-2"
                  >
                    <Menu className="w-5 h-5 text-gray-400" />
                  </button>

                  {/* Mobile Sidebar Toggle */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="p-2 hover:bg-[#2a2a2a]/90 rounded-lg transition-colors lg:hidden -ml-2">
                        <Menu className="w-5 h-5 text-gray-400" />
                      </button>
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      className="w-[320px] p-0 bg-[#1a1a1a]/95 backdrop-blur-lg border-[#2a2a2a]"
                    >
                      {/* Pass the child component directly to let ExploreView handle chat history */}
                      {React.Children.map(children, (child) => {
                        if (React.isValidElement(child)) {
                          return React.cloneElement(
                            child as React.ReactElement<any>,
                            {
                              isSidebarOpen: false,
                              isSheet: true,
                            }
                          );
                        }
                        return child;
                      })}
                    </SheetContent>
                  </Sheet>
                </>
              )}

              <a
                href="/explore"
                onClick={handleLogoClick}
                className="flex items-center gap-2 h-full"
              >
                <img src={logo} alt="Educasm Logo" className="w-7 h-7" />
                <span className="text-lg font-semibold text-gray-100">
                  Educasm
                </span>
              </a>
            </div>

            {/* Logout Button - Only show for authenticated users */}
            {user && (
              <div className="flex items-center h-full">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 h-full px-3 text-sm text-gray-400 
                    hover:text-gray-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 ${!isAuthRoute || user ? "mt-14" : ""} mb-[5.5rem]`}
      >
        <div className="max-w-6xl mx-auto px-4">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && currentPath === "/explore") {
              return React.cloneElement(
                child as React.ReactElement<{ isSidebarOpen: boolean }>,
                { isSidebarOpen }
              );
            }
            return child;
          })}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      {user && !isAuthRoute && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a]/95 backdrop-blur-lg border-t border-[#2a2a2a] z-40">
          <div className="flex justify-around items-center h-12 max-w-6xl mx-auto">
            <Link
              to="/explore"
              className={`flex flex-col items-center gap-0.5 px-6 py-1 rounded-lg
                transition-colors ${
                  currentPath === "/explore"
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              preload="intent"
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px]">Explore</span>
            </Link>

            <Link
              to="/playground"
              className={`flex flex-col items-center gap-0.5 px-6 py-1 rounded-lg
                transition-colors ${
                  currentPath === "/playground"
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              preload="intent"
            >
              <Gamepad2 className="w-5 h-5" />
              <span className="text-[10px]">Playground</span>
            </Link>

            <Link
              to="/progress"
              className={`flex flex-col items-center gap-0.5 px-6 py-1 rounded-lg
                transition-colors ${
                  currentPath === "/progress"
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              preload="intent"
            >
              <LineChart className="w-5 h-5" />
              <span className="text-[10px]">Progress</span>
            </Link>

            <Link
              to="/leaderboard"
              className={`flex flex-col items-center gap-0.5 px-6 py-1 rounded-lg
                transition-colors ${
                  currentPath === "/leaderboard"
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              preload="intent"
            >
              <Trophy className="w-5 h-5" />
              <span className="text-[10px]">Leaderboard</span>
            </Link>

            <Link
              to="/profile"
              className={`flex flex-col items-center gap-0.5 px-6 py-1 rounded-lg
                transition-colors ${
                  currentPath === "/profile"
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              preload="intent"
            >
              <UserCircle className="w-5 h-5" />
              <span className="text-[10px]">Profile</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
};
