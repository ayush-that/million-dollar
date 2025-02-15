import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Clock, Target } from "lucide-react";
import { useAuth } from "../../lib/context/AuthContext";
import { supabase } from "../../lib/supabase/client";

interface LearningGoals {
  dailyTimeMinutes: number;
  weeklyTopics: number;
}

export const ProfileView = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<LearningGoals>({
    dailyTimeMinutes: 120, // 2 hours default
    weeklyTopics: 5,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadGoals();
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("learning_goals")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        // If no goals exist yet, create default goals
        if (error.code === "PGRST116") {
          const { data: newGoals, error: insertError } = await supabase
            .from("learning_goals")
            .insert({
              user_id: user.id,
              daily_time_minutes: 120, // 2 hours default
              weekly_topics: 5,
            })
            .select()
            .single();

          if (insertError) throw insertError;

          if (newGoals) {
            setGoals({
              dailyTimeMinutes: newGoals.daily_time_minutes,
              weeklyTopics: newGoals.weekly_topics,
            });
          }
          return;
        }
        throw error;
      }

      if (data) {
        setGoals({
          dailyTimeMinutes: data.daily_time_minutes,
          weeklyTopics: data.weekly_topics,
        });
      }
    } catch (error) {
      console.error("Error loading goals:", error);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins.toString().padStart(2, "0")}m`;
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setGoals((prev) => ({ ...prev, dailyTimeMinutes: value }));
  };

  const handleTopicsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setGoals((prev) => ({ ...prev, weeklyTopics: value }));
  };

  const handleUpdateGoals = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from("learning_goals").upsert(
        {
          user_id: user.id,
          daily_time_minutes: goals.dailyTimeMinutes,
          weekly_topics: goals.weeklyTopics,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;
    } catch (error) {
      console.error("Error updating goals:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card className="bg-[#1a1a1a]/60 border-[#2a2a2a] rounded-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-200">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24 rounded-none">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-[#2a2a2a] text-gray-400">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  className="border-[#3a3a3a] text-gray-200 rounded-none hover:bg-[#2a2a2a]"
                >
                  Change Avatar
                </Button>
              </div>

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-200">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-gray-200 rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-200">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-gray-200 rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-200">
                      Username
                    </Label>
                    <Input
                      id="username"
                      placeholder="johndoe"
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-gray-200 rounded-none"
                    />
                  </div>
                </div>
                <Button
                  className="w-full md:w-auto border-[#3a3a3a] text-gray-200 rounded-none hover:bg-[#2a2a2a]"
                  variant="outline"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Goals */}
        <Card className="bg-[#1a1a1a]/60 border-[#2a2a2a] rounded-none">
          <CardHeader>
            <CardTitle className="text-gray-200">Learning Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-gray-200">Daily Learning Time Goal</Label>
              <div className="flex items-center gap-4">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-200 min-w-[60px]">
                  {formatTime(goals.dailyTimeMinutes)}
                </span>
              </div>
            </div>

            <Separator className="bg-[#2a2a2a]" />

            <div className="space-y-4">
              <Label className="text-gray-200">Weekly Target Topics</Label>
              <div className="flex items-center gap-4">
                <Target className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-200 min-w-[60px]">
                  {goals.weeklyTopics} topics
                </span>
              </div>
            </div>

            <div className="space-y-8">
              {/* Daily Learning Time Goal */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <label className="text-sm font-medium text-gray-300">
                      Daily Learning Time Goal
                    </label>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {formatTime(goals.dailyTimeMinutes)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-[#3a3a3a] text-gray-200 rounded-none hover:bg-[#2a2a2a]"
                    onClick={() =>
                      setGoals((prev) => ({
                        ...prev,
                        dailyTimeMinutes: Math.max(
                          30,
                          prev.dailyTimeMinutes - 30
                        ),
                      }))
                    }
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={goals.dailyTimeMinutes}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 30 && value <= 480) {
                        setGoals((prev) => ({
                          ...prev,
                          dailyTimeMinutes: value,
                        }));
                      }
                    }}
                    min={30}
                    max={480}
                    step={30}
                    className="w-20 text-center bg-[#2a2a2a] border-[#3a3a3a] text-gray-200 rounded-none"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-[#3a3a3a] text-gray-200 rounded-none hover:bg-[#2a2a2a]"
                    onClick={() =>
                      setGoals((prev) => ({
                        ...prev,
                        dailyTimeMinutes: Math.min(
                          480,
                          prev.dailyTimeMinutes + 30
                        ),
                      }))
                    }
                  >
                    +
                  </Button>
                  <span className="text-sm text-gray-400">minutes</span>
                </div>
              </div>

              {/* Weekly Target Topics */}
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <label className="text-sm font-medium text-gray-300">
                      Weekly Target Topics
                    </label>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {goals.weeklyTopics} topics
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-[#3a3a3a] text-gray-200 rounded-none hover:bg-[#2a2a2a]"
                    onClick={() =>
                      setGoals((prev) => ({
                        ...prev,
                        weeklyTopics: Math.max(1, prev.weeklyTopics - 1),
                      }))
                    }
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={goals.weeklyTopics}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= 20) {
                        setGoals((prev) => ({ ...prev, weeklyTopics: value }));
                      }
                    }}
                    min={1}
                    max={20}
                    step={1}
                    className="w-20 text-center bg-[#2a2a2a] border-[#3a3a3a] text-gray-200 rounded-none"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-[#3a3a3a] text-gray-200 rounded-none hover:bg-[#2a2a2a]"
                    onClick={() =>
                      setGoals((prev) => ({
                        ...prev,
                        weeklyTopics: Math.min(20, prev.weeklyTopics + 1),
                      }))
                    }
                  >
                    +
                  </Button>
                  <span className="text-sm text-gray-400">topics</span>
                </div>
              </div>

              {/* Update Button */}
              <Button
                onClick={handleUpdateGoals}
                disabled={isSaving}
                variant="outline"
                className="w-full mt-8 border-[#3a3a3a] text-gray-200 rounded-none hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Update Goals"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
