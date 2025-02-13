import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

export const GoogleTagManager = () => {
  const router = useRouter();

  useEffect(() => {
    // Push the new route to dataLayer
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "pageview",
        page: router.state.location.pathname + router.state.location.search,
      });
    }
  }, [router.state.location]);

  return null;
};
