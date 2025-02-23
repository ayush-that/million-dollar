export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          email: string;
          age: number;
          created_at: string;
          updated_at: string;
        };
      };
      user_scores: {
        Row: {
          id: string;
          user_id: string;
          correct_answers: number;
          updated_at: string;
        };
      };
      learning_goals: {
        Row: {
          id: string;
          user_id: string;
          daily_time_minutes: number;
          weekly_topics: number;
          updated_at: string;
        };
      };
    };
  };
};
