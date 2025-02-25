"use client";

import ErrorBoundary from "@/components/ErrorBoundary";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
    </ErrorBoundary>
  );
} 