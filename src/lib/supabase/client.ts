import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/types/supabase";
import { getAppUrl } from "../utils";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

class SupabaseClient {
  private static instance: ReturnType<typeof createClient<Database>>;

  private static createInstance() {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        storage: window.localStorage,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  public static getInstance() {
    if (!SupabaseClient.instance) {
      SupabaseClient.instance = SupabaseClient.createInstance();
    }
    return SupabaseClient.instance;
  }
}

export const supabase = SupabaseClient.getInstance();

// Auth helper functions
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getAppUrl()}/auth/callback`,
    },
  });
  return { data, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
};

export const signInWithGoogle = async () => {
  const redirectTo =
    window.location.hostname === "localhost"
      ? `${window.location.origin}/auth/callback`
      : "https://million-dollar-chi.vercel.app/auth/callback";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });
  return { data, error };
};

export const resetPassword = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getAppUrl()}/auth/callback`,
  });
};

export const updatePassword = async (newPassword: string) => {
  return await supabase.auth.updateUser({
    password: newPassword,
  });
};

// Auth state change listener
export const onAuthStateChange = (
  callback: (event: any, session: any) => void
) => {
  return supabase.auth.onAuthStateChange(callback);
};
