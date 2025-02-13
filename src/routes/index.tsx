import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { ExploreView } from "../components/Explore/ExploreView";
import { PlaygroundView } from "../components/Playground/PlaygroundView";
import { Login } from "../components/Login";
import { AuthCallback } from "../components/auth/AuthCallback";
import { Layout } from "../components/Layout/Layout";
import { PreFillForm } from "../components/shared/PreFillForm";
import { ProgressView } from "../components/Progress/ProgressView";
import { ProfileView } from "../components/Profile/ProfileView";
import { useAuth } from "../lib/context/AuthContext";

// Root Route
export const rootRoute = createRootRoute({
  component: () => {
    return (
      <div className="min-h-screen bg-background text-white">
        <Outlet />
      </div>
    );
  },
});

// Auth Layout Route - for routes that don't require authentication
const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "auth",
  component: () => <Outlet />,
});

// Protected Layout Route - for routes that require authentication
const protectedLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  component: () => {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!user) {
      throw redirect({
        to: "/login",
      });
    }

    return (
      <Layout>
        <Outlet />
      </Layout>
    );
  },
});

// Auth Routes
export const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/login",
  component: () => {
    const { user } = useAuth();
    if (user) {
      throw redirect({
        to: "/explore",
      });
    }
    return <Login />;
  },
});

export const authCallbackRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/auth/callback",
  component: AuthCallback,
});

// Protected Routes
export const indexRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/",
  component: () => <redirect to="/explore" />,
});

export const exploreRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/explore",
  component: () => (
    <ExploreView
      onError={(msg) => console.error(msg)}
      userContext={{ age: 25 }}
    />
  ),
});

export const playgroundRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/playground",
  component: PlaygroundView,
});

export const progressRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/progress",
  component: ProgressView,
});

export const profileRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/profile",
  component: ProfileView,
});

export const leaderboardRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/leaderboard",
  component: () => (
    <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
      Leaderboard coming soon...
    </div>
  ),
});

export const prefillRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/prefill",
  component: PreFillForm,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  authLayoutRoute.addChildren([loginRoute, authCallbackRoute]),
  protectedLayoutRoute.addChildren([
    indexRoute,
    exploreRoute,
    playgroundRoute,
    progressRoute,
    profileRoute,
    leaderboardRoute,
    prefillRoute,
  ]),
]);

// Create and export the router
export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

// Register your router for maximum type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
