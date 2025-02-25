"use client";

import { useEffect, useState } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-4">Loading...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gray-50">{children}</main>
    </ErrorBoundary>
  );
}
