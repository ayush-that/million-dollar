import { createRouter, createRoute, Outlet } from "@tanstack/react-router";
import { ExploreView } from "./components/Explore/ExploreView";
import { PlaygroundView } from "./components/Playground/PlaygroundView";
import { LeaderboardView } from "./components/Leaderboard/LeaderboardView";
import { ProgressView } from "./components/Progress/ProgressView";
import { ProfileView } from "./components/Profile/ProfileView";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { toast } from "react-hot-toast";
import { Layout } from "./components/Layout/Layout";

const handleError = (message: string) => {
  toast.error(message);
};

const handleSuccess = (message: string) => {
  toast.success(message);
};

const userContext = { age: 16 };

// Create the root route
export const rootRoute = createRoute({
  component: () => (
    <Layout>
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    </Layout>
  ),
});

export const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/explore",
  component: () => (
    <ExploreView
      onError={handleError}
      onRelatedQueryClick={(query) => console.log("Related query:", query)}
      userContext={userContext}
      onSearch={(query) => console.log("Searching:", query)}
    />
  ),
});

export const playgroundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/playground",
  component: () => (
    <PlaygroundView
      onError={handleError}
      onSuccess={handleSuccess}
      userContext={userContext}
    />
  ),
});

export const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leaderboard",
  component: () => <LeaderboardView onError={handleError} />,
});

export const progressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/progress",
  component: () => <ProgressView />,
});

export const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => <ProfileView />,
});

export const routeTree = rootRoute.addChildren([
  exploreRoute,
  playgroundRoute,
  leaderboardRoute,
  progressRoute,
  profileRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
