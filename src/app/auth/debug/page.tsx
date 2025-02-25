"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase/client";

export default function AuthDebugPage() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [urlInfo, setUrlInfo] = useState<any>({});

  useEffect(() => {
    // Get URL information
    const url = new URL(window.location.href);
    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    setUrlInfo({
      full: url.toString(),
      origin: url.origin,
      pathname: url.pathname,
      params,
    });

    // Get session information
    const getSession = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setError(error.message);
        } else {
          setSession(data.session);

          if (data.session?.user) {
            setUser(data.session.user);
          }
        }
      } catch (err: any) {
        setError(err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    getSession();
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>

      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">URL Information</h2>
        <pre className="bg-white p-3 rounded overflow-auto">
          {JSON.stringify(urlInfo, null, 2)}
        </pre>
      </div>

      {loading ? (
        <div className="text-center p-4">Loading...</div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg mb-6">
          <h2 className="font-semibold">Error</h2>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">Session</h2>
            <pre className="bg-white p-3 rounded overflow-auto">
              {session ? JSON.stringify(session, null, 2) : "No active session"}
            </pre>
          </div>

          <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">User</h2>
            <pre className="bg-white p-3 rounded overflow-auto">
              {user ? JSON.stringify(user, null, 2) : "No user found"}
            </pre>
          </div>
        </>
      )}

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => (window.location.href = "/login")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Login
        </button>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.reload();
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
