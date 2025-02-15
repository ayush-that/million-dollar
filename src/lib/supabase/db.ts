import { supabase } from "./client";

export interface Profile {
  id: string;
  age: number;
  username: string;
  display_name: string;
  email: string;
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

export interface UserProgress {
  id: string;
  user_id: string;
  total_questions: number;
  correct_answers: number;
  topics_explored: string[];
  streak_days: number;
  last_activity_date: string;
  topics_mastered: string[];
  average_response_time: number;
  difficulty_level: number;
  created_at?: string;
  updated_at: string;
}

export interface TopicProgress {
  id: string;
  user_id: string;
  topic: string;
  questions_attempted: number;
  correct_answers: number;
  mastery_level: number; // 0-100
  last_attempt_date: string;
  created_at?: string;
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

    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profile.id)
      .single();

    console.log("Existing profile:", existingProfile);

    // Prepare profile data, preserving existing data if any
    const updatedProfile = {
      ...(existingProfile || {}),
      ...profile,
      updated_at: new Date().toISOString(),
    };

    console.log("Upserting profile with data:", updatedProfile);

    const { data, error } = await supabase
      .from("profiles")
      .upsert(updatedProfile)
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
  try {
    // First get the current score
    const { data: currentScore, error: fetchError } = await supabase
      .from("user_scores")
      .select("correct_answers")
      .eq("user_id", userId)
      .single();

    if (fetchError) throw fetchError;

    const newScore = (currentScore?.correct_answers || 0) + 1;

    // Update the score
    const { error: updateError } = await supabase.from("user_scores").upsert(
      {
        user_id: userId,
        correct_answers: newScore,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

    if (updateError) throw updateError;

    console.log(`Updated score for user ${userId} to ${newScore}`);
  } catch (error) {
    console.error("Error updating user score:", error);
    throw error;
  }
};

export const initializeUserScore = async (userId: string): Promise<void> => {
  try {
    const { data: existingScore } = await supabase
      .from("user_scores")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!existingScore) {
      const { error } = await supabase.from("user_scores").insert({
        user_id: userId,
        correct_answers: 0,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    }
  } catch (error) {
    console.error("Error initializing user score:", error);
    throw error;
  }
};

export const getTopUsers = async (limit: number = 10): Promise<UserScore[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await initializeUserScore(user.id).catch(console.error);
    }

    console.log("Fetching top users...");
    const { data: scores, error } = await supabase
      .from("user_scores")
      .select(
        `
        id,
        user_id,
        correct_answers,
        updated_at,
        user:user_id (
          email
        ),
        profile:profiles!left (
          username,
          display_name,
          email,
          age
        )
      `
      )
      .order("correct_answers", { ascending: false })
      .limit(limit);

    if (error) throw error;
    console.log("Fetched scores:", scores);

    return scores.map((score) => ({
      ...score,
      profile: score.profile || {
        id: score.user_id,
        age: 0,
        username:
          score.user?.email?.split("@")[0] ||
          `User_${score.user_id.slice(0, 8)}`,
        display_name:
          score.user?.email?.split("@")[0] ||
          `User_${score.user_id.slice(0, 8)}`,
        email: score.user?.email || "",
      },
    }));
  } catch (error) {
    console.error("Error in getTopUsers:", error);
    return [];
  }
};

export const updateProgress = async (
  userId: string,
  data: {
    isCorrect: boolean;
    topic: string;
    responseTime: number;
    difficulty: number;
  }
): Promise<void> => {
  try {
    // Get or create user progress
    let { data: userProgress, error: progressError } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (progressError && progressError.code === "PGRST116") {
      // Progress doesn't exist, create it
      const { data: newProgress, error: createError } = await supabase
        .from("user_progress")
        .insert({
          user_id: userId,
          total_questions: 0,
          correct_answers: 0,
          topics_explored: [],
          streak_days: 0,
          last_activity_date: new Date().toISOString(),
          topics_mastered: [],
          average_response_time: 0,
          difficulty_level: 1,
        })
        .select()
        .single();

      if (createError) throw createError;
      userProgress = newProgress;
    } else if (progressError) {
      throw progressError;
    }

    // Get or create topic progress
    let { data: topicProgress, error: topicError } = await supabase
      .from("topic_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("topic", data.topic)
      .single();

    if (topicError && topicError.code === "PGRST116") {
      const { data: newTopicProgress, error: createTopicError } = await supabase
        .from("topic_progress")
        .insert({
          user_id: userId,
          topic: data.topic,
          questions_attempted: 0,
          correct_answers: 0,
          mastery_level: 0,
          last_attempt_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (createTopicError) throw createTopicError;
      topicProgress = newTopicProgress;
    } else if (topicError) {
      throw topicError;
    }

    // Update user progress
    const updatedUserProgress = {
      total_questions: (userProgress.total_questions || 0) + 1,
      correct_answers:
        (userProgress.correct_answers || 0) + (data.isCorrect ? 1 : 0),
      topics_explored: Array.from(
        new Set([...(userProgress.topics_explored || []), data.topic])
      ),
      streak_days: calculateStreak(userProgress.last_activity_date),
      last_activity_date: new Date().toISOString(),
      average_response_time: calculateNewAverage(
        userProgress.average_response_time,
        data.responseTime,
        userProgress.total_questions
      ),
      difficulty_level: calculateNewDifficulty(
        userProgress.difficulty_level,
        data.isCorrect
      ),
    };

    // Update topic progress
    const updatedTopicProgress = {
      questions_attempted: (topicProgress.questions_attempted || 0) + 1,
      correct_answers:
        (topicProgress.correct_answers || 0) + (data.isCorrect ? 1 : 0),
      mastery_level: calculateMasteryLevel(
        topicProgress.correct_answers + (data.isCorrect ? 1 : 0),
        topicProgress.questions_attempted + 1
      ),
      last_attempt_date: new Date().toISOString(),
    };

    // Save updates
    const { error: updateError } = await supabase
      .from("user_progress")
      .update(updatedUserProgress)
      .eq("user_id", userId);

    if (updateError) throw updateError;

    const { error: topicUpdateError } = await supabase
      .from("topic_progress")
      .update(updatedTopicProgress)
      .eq("user_id", userId)
      .eq("topic", data.topic);

    if (topicUpdateError) throw topicUpdateError;
  } catch (error) {
    console.error("Error updating progress:", error);
    throw error;
  }
};

export const getUserProgress = async (
  userId: string
): Promise<{
  userProgress: UserProgress;
  topicProgress: TopicProgress[];
}> => {
  try {
    // Get user progress
    const { data: userProgress, error: progressError } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (progressError) throw progressError;

    // Get all topic progress
    const { data: topicProgress, error: topicError } = await supabase
      .from("topic_progress")
      .select("*")
      .eq("user_id", userId)
      .order("mastery_level", { ascending: false });

    if (topicError) throw topicError;

    return {
      userProgress,
      topicProgress: topicProgress || [],
    };
  } catch (error) {
    console.error("Error fetching progress:", error);
    throw error;
  }
};

// Helper functions
function calculateStreak(lastActivityDate: string): number {
  const lastActivity = new Date(lastActivityDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastActivity.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If last activity was today, maintain streak
  if (diffDays === 0) return 1;
  // If last activity was yesterday, increment streak
  if (diffDays === 1) return 2;
  // Otherwise reset streak
  return 0;
}

function calculateNewAverage(
  currentAverage: number,
  newValue: number,
  totalCount: number
): number {
  return (currentAverage * (totalCount - 1) + newValue) / totalCount;
}

function calculateNewDifficulty(
  currentDifficulty: number,
  wasCorrect: boolean
): number {
  const maxDifficulty = 5;
  const minDifficulty = 1;
  const step = 0.5;

  const newDifficulty = currentDifficulty + (wasCorrect ? step : -step);
  return Math.min(Math.max(newDifficulty, minDifficulty), maxDifficulty);
}

function calculateMasteryLevel(
  correctAnswers: number,
  totalAttempts: number
): number {
  if (totalAttempts === 0) return 0;
  const accuracy = (correctAnswers / totalAttempts) * 100;
  // Apply a weighted formula that considers both accuracy and number of attempts
  const attemptsWeight = Math.min(totalAttempts / 10, 1); // Cap at 10 attempts
  return Math.round(accuracy * attemptsWeight);
}
