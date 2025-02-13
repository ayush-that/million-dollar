import React, { useState, useEffect } from "react";
import { getTopUsers, UserScore } from "../../lib/supabase/db";
import { Loading } from "../shared/Loading";
import { Trophy, Medal } from "lucide-react";

interface LeaderboardViewProps {
  onError: (message: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  onError,
}) => {
  const [users, setUsers] = useState<UserScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLeaderboard = async () => {
    try {
      const topUsers = await getTopUsers();
      setUsers(topUsers);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      onError("Failed to load leaderboard. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();

    // Refresh leaderboard every 30 seconds
    const interval = setInterval(loadLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h1 className="text-2xl font-semibold text-gray-100">Leaderboard</h1>
        </div>
        <button
          onClick={loadLeaderboard}
          className="px-3 py-1.5 rounded-lg bg-[#1a1a1a]/90 hover:bg-[#2a2a2a]/90 
            border border-[#2a2a2a] text-sm text-gray-400 hover:text-gray-200 
            transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {users.length > 0 ? (
          users.map((user, index) => (
            <div
              key={user.id}
              className="flex items-center gap-4 bg-[#1a1a1a]/90 backdrop-blur-lg 
                border border-[#2a2a2a] p-4 rounded-lg"
            >
              <div className="flex-shrink-0 w-8 text-center">
                {index === 0 ? (
                  <Medal className="w-6 h-6 text-yellow-500 mx-auto" />
                ) : index === 1 ? (
                  <Medal className="w-6 h-6 text-gray-400 mx-auto" />
                ) : index === 2 ? (
                  <Medal className="w-6 h-6 text-amber-700 mx-auto" />
                ) : (
                  <span className="text-gray-500 font-medium">{index + 1}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-base font-medium text-gray-200 truncate">
                    {(user as any).profiles?.username ||
                      (user as any).profiles?.full_name ||
                      "Anonymous User"}
                  </h3>
                  <span className="text-xs text-gray-500">
                    Last active:{" "}
                    {new Date(user.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-semibold text-primary">
                  {user.correct_answers}
                </span>
                <span className="text-xs text-gray-500">correct</span>
              </div>
            </div>
          ))
        ) : (
          <div
            className="text-center py-12 bg-[#1a1a1a]/90 backdrop-blur-lg 
            border border-[#2a2a2a] rounded-lg"
          >
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No Scores Yet
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Start practicing in the Playground to see your name on the
              leaderboard! Answer questions correctly to climb the ranks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
