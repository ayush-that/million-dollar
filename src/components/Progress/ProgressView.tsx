import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Clock, Target, Brain, Trophy } from "lucide-react";

export const ProgressView = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#1a1a1a]/60 border-[#2a2a2a]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">
              Today's Learning
            </CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">2h 15m</div>
            <p className="text-xs text-gray-400">+45m from yesterday</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a]/60 border-[#2a2a2a]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">
              Daily Goal
            </CardTitle>
            <Target className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">75%</div>
            <p className="text-xs text-gray-400">1h 45m remaining</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a]/60 border-[#2a2a2a]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">
              Topics Mastered
            </CardTitle>
            <Brain className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">12</div>
            <p className="text-xs text-gray-400">+2 this week</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a]/60 border-[#2a2a2a]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">
              Current Streak
            </CardTitle>
            <Trophy className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">7 days</div>
            <p className="text-xs text-gray-400">Best: 15 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Todo List */}
        <Card className="bg-[#1a1a1a]/60 border-[#2a2a2a] lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-gray-200">Learning Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add a new task..."
                className="bg-[#2a2a2a] border-[#3a3a3a] text-gray-200"
              />
              <Button
                size="icon"
                variant="outline"
                className="border-[#3a3a3a]"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {[
                  "Complete Quantum Physics module",
                  "Practice Machine Learning exercises",
                  "Review World History notes",
                  "Take practice quiz",
                ].map((task, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-2 bg-[#2a2a2a]/40 p-2 rounded-lg"
                  >
                    <Checkbox id={`task-${i}`} />
                    <label
                      htmlFor={`task-${i}`}
                      className="text-sm text-gray-300 flex-1"
                    >
                      {task}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Learning Time Chart */}
        <Card className="bg-[#1a1a1a]/60 border-[#2a2a2a] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-200">Learning Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Chart will be implemented here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
