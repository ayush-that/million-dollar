import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Clock, Mail, Target } from "lucide-react";
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

      if (error) throw error;

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
        <Card className="bg-[#1a1a1a]/60 border-[#2a2a2a] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-200">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-[#2a2a2a] text-gray-400">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  className="border-[#3a3a3a] text-gray-200"
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
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-gray-200"
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
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-200">
                      Username
                    </Label>
                    <Input
                      id="username"
                      placeholder="johndoe"
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-gray-200">
                      Timezone
                    </Label>
                    <Input
                      id="timezone"
                      placeholder="UTC+00:00"
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-gray-200"
                    />
                  </div>
                </div>
                <Button className="w-full md:w-auto">Save Changes</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Goals */}
        <Card className="bg-[#1a1a1a]/60 border-[#2a2a2a]">
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

                <div className="relative">
                  <input
                    type="range"
                    min="30"
                    max="480"
                    step="30"
                    value={goals.dailyTimeMinutes}
                    onChange={handleTimeChange}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-primary
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:w-4
                      [&::-moz-range-thumb]:h-4
                      [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-primary
                      [&::-moz-range-thumb]:border-0
                      [&::-moz-range-thumb]:cursor-pointer"
                  />
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                    <span>30m</span>
                    <span>8h</span>
                  </div>
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

                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={goals.weeklyTopics}
                    onChange={handleTopicsChange}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-primary
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:w-4
                      [&::-moz-range-thumb]:h-4
                      [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-primary
                      [&::-moz-range-thumb]:border-0
                      [&::-moz-range-thumb]:cursor-pointer"
                  />
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                    <span>1</span>
                    <span>20</span>
                  </div>
                </div>
              </div>

              {/* Update Button */}
              <button
                onClick={handleUpdateGoals}
                disabled={isSaving}
                className="w-full mt-8 px-4 py-2 bg-primary text-white rounded-lg font-medium
                  hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Update Goals"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
