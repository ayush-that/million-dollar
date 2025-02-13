import { supabase } from "./client";

export interface Profile {
  id: string;
  age: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  type: "user" | "ai";
  content: string;
  topics?: Array<{
    topic: string;
    type: string;
    reason: string;
  }>;
  questions?: Array<{
    question: string;
    type: string;
    context: string;
  }>;
  created_at: string;
  session_id: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  created_at: string;
  last_message_at: string;
  title: string;
}

export interface UserScore {
  id: string;
  user_id: string;
  correct_answers: number;
  updated_at: string;
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

export async function createChatSession(
  userId: string,
  title: string
): Promise<ChatSession | null> {
  try {
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: userId,
        title: title.substring(0, 100), // Limit title length
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error creating chat session:", err);
    return null;
  }
}

export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  try {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("last_message_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching chat sessions:", err);
    return [];
  }
}

export async function saveChatMessage(
  userId: string,
  sessionId: string,
  message: Omit<ChatMessage, "id" | "user_id" | "created_at" | "session_id">
): Promise<ChatMessage | null> {
  try {
    // Start a transaction
    const { data: messageData, error: messageError } = await supabase
      .from("chat_messages")
      .insert({
        user_id: userId,
        session_id: sessionId,
        type: message.type,
        content: message.content,
        topics: message.topics,
        questions: message.questions,
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Update the session's last_message_at and title if it's the first message
    const { error: sessionError } = await supabase
      .from("chat_sessions")
      .update({
        last_message_at: new Date().toISOString(),
        ...(message.type === "user"
          ? { title: message.content.substring(0, 100) }
          : {}),
      })
      .eq("id", sessionId);

    if (sessionError) throw sessionError;

    return messageData;
  } catch (err) {
    console.error("Error saving chat message:", err);
    return null;
  }
}

export async function getChatMessages(
  sessionId: string
): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching chat messages:", err);
    return [];
  }
}

export const updateUserScore = async (userId: string): Promise<void> => {
  const { error } = await supabase.from("user_scores").upsert({
    user_id: userId,
    correct_answers: supabase.rpc("increment_score"),
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
};

export const initializeUserScore = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase.from("user_scores").upsert(
      {
        user_id: userId,
        correct_answers: 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) throw error;
  } catch (error) {
    console.error("Error initializing user score:", error);
    throw error;
  }
};

export const getTopUsers = async (limit: number = 10): Promise<UserScore[]> => {
  try {
    // Get current user to ensure they have a score entry
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await initializeUserScore(user.id).catch(console.error);
    }

    const { data, error } = await supabase
      .from("user_scores")
      .select(
        `
        id,
        user_id,
        correct_answers,
        updated_at,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `
      )
      .order("correct_answers", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error in getTopUsers:", error);
    return [];
  }
};
