import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/context/AuthContext";
import { LineChart, Target, Trophy, Timer, Award } from "lucide-react";
import { getTopUsers, UserScore } from "../../lib/supabase/db";

interface ProgressStats {
  totalQuestions: number;
  correctAnswers: number;
  averageTime: number;
  streak: number;
  topics: { [key: string]: number };
}

export const ProgressView = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProgressStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    averageTime: 0,
    streak: 0,
    topics: {},
  });
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;

      try {
        // Get user's rank from leaderboard
        const topUsers = await getTopUsers(100); // Get top 100 to find user's rank
        const userRank = topUsers.findIndex((u) => u.user_id === user.id) + 1;
        setRank(userRank > 0 ? userRank : null);

        // For now, using mock data - in a real app, fetch from your database
        setStats({
          totalQuestions: 50,
          correctAnswers: 35,
          averageTime: 45,
          streak: 7,
          topics: {
            "Quantum Physics": 15,
            "Machine Learning": 12,
            "World History": 8,
          },
        });
      } catch (error) {
        console.error("Error loading progress stats:", error);
      }
    };

    loadStats();
  }, [user]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1a1a1a]/90 backdrop-blur-lg border border-[#2a2a2a] p-4 rounded-lg">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Target className="w-5 h-5" />
            <span className="text-sm font-medium">Questions</span>
          </div>
          <div className="text-2xl font-semibold">{stats.totalQuestions}</div>
          <div className="text-xs text-gray-500 mt-1">Total attempts</div>
        </div>

        <div className="bg-[#1a1a1a]/90 backdrop-blur-lg border border-[#2a2a2a] p-4 rounded-lg">
          <div className="flex items-center gap-2 text-green-500 mb-1">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-medium">Correct</span>
          </div>
          <div className="text-2xl font-semibold">{stats.correctAnswers}</div>
          <div className="text-xs text-gray-500 mt-1">
            {((stats.correctAnswers / stats.totalQuestions) * 100).toFixed(1)}%
            accuracy
          </div>
        </div>

        <div className="bg-[#1a1a1a]/90 backdrop-blur-lg border border-[#2a2a2a] p-4 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-500 mb-1">
            <Award className="w-5 h-5" />
            <span className="text-sm font-medium">Streak</span>
          </div>
          <div className="text-2xl font-semibold">{stats.streak}</div>
          <div className="text-xs text-gray-500 mt-1">Current streak</div>
        </div>

        <div className="bg-[#1a1a1a]/90 backdrop-blur-lg border border-[#2a2a2a] p-4 rounded-lg">
          <div className="flex items-center gap-2 text-purple-500 mb-1">
            <Timer className="w-5 h-5" />
            <span className="text-sm font-medium">Time</span>
          </div>
          <div className="text-2xl font-semibold">{stats.averageTime}s</div>
          <div className="text-xs text-gray-500 mt-1">Average per question</div>
        </div>
      </div>

      {/* Topics Progress */}
      <div className="bg-[#1a1a1a]/90 backdrop-blur-lg border border-[#2a2a2a] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">
          Topics Mastery
        </h2>
        <div className="space-y-4">
          {Object.entries(stats.topics).map(([topic, count]) => (
            <div key={topic}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-300">{topic}</span>
                <span className="text-sm text-gray-400">{count} questions</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(count / stats.totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rank Display */}
      {rank && (
        <div className="mt-6 text-center">
          <div className="inline-block bg-[#1a1a1a]/90 backdrop-blur-lg border border-[#2a2a2a] rounded-lg px-6 py-3">
            <span className="text-gray-400">Your Global Rank: </span>
            <span className="text-xl font-semibold text-primary">#{rank}</span>
          </div>
        </div>
      )}
    </div>
  );
};
