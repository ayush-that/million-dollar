// src/App.tsx
import { RouterProvider } from "@tanstack/react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./lib/context/AuthContext";
import { router } from "./routes";

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
