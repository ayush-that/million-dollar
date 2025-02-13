import {
  createRouter,
  createRoute,
  Outlet,
  createRootRoute,
} from "@tanstack/react-router";
import { ExploreView } from "./components/Explore/ExploreView";
import { PlaygroundView } from "./components/Playground/PlaygroundView";
import { LeaderboardView } from "./components/Leaderboard/LeaderboardView";
import { ProgressView } from "./components/Progress/ProgressView";
import { ProfileView } from "./components/Profile/ProfileView";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { toast } from "react-hot-toast";
import { Layout } from "./components/Layout/Layout";
import { Login } from "./components/Login";
import { AuthCallback } from "./components/auth/AuthCallback";

const handleError = (message: string) => {
  toast.error(message);
};

const handleSuccess = (message: string) => {
  toast.success(message);
};

const userContext = { age: 16 };

// Create the root route
export const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Create auth layout route
const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "auth",
  component: () => <Outlet />,
});

// Create protected layout route
const protectedLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  component: () => (
    <Layout>
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    </Layout>
  ),
});

// Auth routes
export const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/login",
  component: Login,
});

export const authCallbackRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/auth/callback",
  component: AuthCallback,
});

// Protected routes
export const indexRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/",
  component: () => (
    <ExploreView
      onError={handleError}
      userContext={userContext}
      onSearch={(query) => console.log("Searching:", query)}
    />
  ),
});

export const exploreRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/explore",
  component: () => (
    <ExploreView
      onError={handleError}
      userContext={userContext}
      onSearch={(query) => console.log("Searching:", query)}
    />
  ),
});

export const playgroundRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/playground",
  component: () => (
    <PlaygroundView
      onError={handleError}
      onSuccess={handleError}
      userContext={userContext}
    />
  ),
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
  component: () => <LeaderboardView onError={handleError} />,
});

// Create the route tree
export const routeTree = rootRoute.addChildren([
  authLayoutRoute.addChildren([loginRoute, authCallbackRoute]),
  protectedLayoutRoute.addChildren([
    indexRoute,
    exploreRoute,
    playgroundRoute,
    progressRoute,
    profileRoute,
    leaderboardRoute,
  ]),
]);

// Create and export the router
export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
