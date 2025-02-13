// src/App.tsx
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { ExploreView } from "./components/Explore/ExploreView";
import { PlaygroundView } from "./components/Playground/PlaygroundView";
// import { TestView } from './components/Test/TestView';
import { PreFillForm } from "./components/shared/PreFillForm";
import { UserContext } from "./types";
import { Toaster, toast } from "react-hot-toast";
import { GoogleTagManager } from "./components/shared/GoogleTagManager";
import { AuthProvider } from "./lib/context/AuthContext";
import { Login } from "./components/Login";
import { AuthCallback } from "./components/auth/AuthCallback";
import { useAuth } from "./lib/context/AuthContext";
import { getProfile } from "./lib/supabase/db";

function AppContent() {
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const profile = await getProfile(user.id);
        if (profile) {
          setUserContext({
            age: profile.age
          });
        }
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const handleError = (message: string) => {
    toast.error(message);
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
  };

  // If not logged in, show login page
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Show loading state while checking profile
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If logged in but no userContext, show PreFillForm
  if (!userContext) {
    return (
      <div className="min-h-screen bg-background text-white p-4">
        <PreFillForm onSubmit={(context) => setUserContext(context)} userId={user.id} />
      </div>
    );
  }

  // Main app routes for authenticated users with userContext
  return (
    <Routes>
      <Route
        path="/"
        element={<ExploreView onError={handleError} userContext={userContext} />}
      />
      <Route
        path="/playground"
        element={
          <PlaygroundView
            onError={handleError}
            onSuccess={handleSuccess}
            userContext={userContext}
          />
        }
      />
      {/* <Route 
        path="/test" 
        element={
          <TestView 
            onError={handleError}
            onSuccess={handleSuccess}
            userContext={userContext}
          />
        } 
      /> */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <GoogleTagManager />
        <div className="min-h-screen bg-background text-white">
          <Toaster position="top-right" />
          <Layout>
            <AppContent />
          </Layout>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
