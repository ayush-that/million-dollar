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

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const currentPath = router.state.location.pathname;
  const [isSidebarOpen] = useState(true);

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
          <div className="flex items-center justify-between h-14 px-3 sm:px-5 mx-5">
            <div className="flex items-center h-full gap-2 sm:gap-3">
              {currentPath === "/explore" && (
                <>
                  {/* Mobile Sidebar Toggle */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="p-1.5 sm:p-2 hover:bg-[#2a2a2a]/90 rounded-lg transition-colors lg:hidden">
                        <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </button>
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      className="w-[280px] sm:w-[320px] p-0 bg-[#1a1a1a]/95 backdrop-blur-lg border-[#2a2a2a]"
                    >
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
                className="flex items-center gap-1.5 sm:gap-2 h-full"
              >
                <img
                  src={logo}
                  alt="Educasm Logo"
                  className="w-6 h-6 sm:w-7 sm:h-7"
                />
                <span className="text-base sm:text-lg font-semibold text-gray-100">
                  Educasm
                </span>
              </a>
            </div>

            {/* Logout Button - Only show for authenticated users */}
            {user && (
              <div className="flex items-center h-full">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 h-full px-2 sm:px-3 text-xs sm:text-sm text-gray-400 
                    hover:text-gray-200 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 ${
          !isAuthRoute || user ? "mt-14" : ""
        } mb-32 sm:mb-24`}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-4 w-full pb-8">
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
          <div className="flex justify-around items-center h-20 sm:h-16 max-w-6xl mx-auto px-2 pb-safe">
            <Link
              to="/explore"
              className={`flex flex-col items-center gap-0.5 px-3 sm:px-6 py-1 rounded-lg
                transition-colors ${
                  currentPath === "/explore"
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              preload="intent"
            >
              <Compass className="w-5 h-5 sm:w-5 sm:h-5" />
              <span className="text-[10px]">Explore</span>
            </Link>

            <Link
              to="/playground"
              className={`flex flex-col items-center gap-0.5 px-3 sm:px-6 py-1 rounded-lg
                transition-colors ${
                  currentPath === "/playground"
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              preload="intent"
            >
              <Gamepad2 className="w-5 h-5 sm:w-5 sm:h-5" />
              <span className="text-[10px]">Playground</span>
            </Link>

            <Link
              to="/progress"
              className={`flex flex-col items-center gap-0.5 px-3 sm:px-6 py-1 rounded-lg
                transition-colors ${
                  currentPath === "/progress"
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              preload="intent"
            >
              <LineChart className="w-5 h-5 sm:w-5 sm:h-5" />
              <span className="text-[10px]">Progress</span>
            </Link>

            <Link
              to="/leaderboard"
              className={`flex flex-col items-center gap-0.5 px-3 sm:px-6 py-1 rounded-lg
                transition-colors ${
                  currentPath === "/leaderboard"
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              preload="intent"
            >
              <Trophy className="w-5 h-5 sm:w-5 sm:h-5" />
              <span className="text-[10px]">Leaderboard</span>
            </Link>

            <Link
              to="/profile"
              className={`flex flex-col items-center gap-0.5 px-3 sm:px-6 py-1 rounded-lg
                transition-colors ${
                  currentPath === "/profile"
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              preload="intent"
            >
              <UserCircle className="w-5 h-5 sm:w-5 sm:h-5" />
              <span className="text-[10px]">Profile</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
};
