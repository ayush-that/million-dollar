import { supabase } from "./client";

export interface Profile {
  id: string;
  age: number;
  created_at?: string;
  updated_at?: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error.message);
    console.error("Error details:", error);
    return null;
  }

  return data;
}

export async function upsertProfile(
  profile: Partial<Profile> & { id: string }
): Promise<Profile | null> {
  try {
    console.log("Attempting to upsert profile:", profile);

    const { data, error } = await supabase
      .from("profiles")
      .upsert(profile)
      .select()
      .single();

    if (error) {
      console.error("Error upserting profile:", error.message);
      console.error("Error details:", error);
      console.error("Error code:", error.code);
      throw error;
    }

    console.log("Successfully upserted profile:", data);
    return data;
  } catch (err) {
    console.error("Caught error in upsertProfile:", err);
    return null;
  }
}
