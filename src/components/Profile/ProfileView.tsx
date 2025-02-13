import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Clock, Mail, Target } from "lucide-react";

export const ProfileView = () => {
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
                <Slider
                  defaultValue={[120]}
                  max={480}
                  step={30}
                  className="flex-1"
                />
                <span className="text-sm text-gray-200 min-w-[60px]">
                  2h 00m
                </span>
              </div>
            </div>

            <Separator className="bg-[#2a2a2a]" />

            <div className="space-y-4">
              <Label className="text-gray-200">Weekly Target Topics</Label>
              <div className="flex items-center gap-4">
                <Target className="h-4 w-4 text-gray-400" />
                <Slider
                  defaultValue={[5]}
                  max={20}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-gray-200 min-w-[60px]">
                  5 topics
                </span>
              </div>
            </div>

            <Button className="w-full">Update Goals</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
