import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/context/AuthContext";
import { getProfile, upsertProfile } from "../../lib/supabase/db";
import { Button, Input } from "@nextui-org/react";

export const ProfileForm: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const profile = await getProfile(user.id);
    if (profile) {
      setFormData({
        username: profile.username || "",
        display_name: profile.display_name || "",
        email: profile.email || user.email || "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await upsertProfile({
        id: user.id,
        username: formData.username,
        display_name: formData.display_name,
        email: formData.email,
        age: 16, // Default age, you can make this configurable if needed
      });
      // Show success message or redirect
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Update Your Profile</h2>

      <Input
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Choose a username"
        required
        className="max-w-md"
      />

      <Input
        label="Display Name"
        name="display_name"
        value={formData.display_name}
        onChange={handleChange}
        placeholder="Enter your display name"
        required
        className="max-w-md"
      />

      <Input
        label="Email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
        type="email"
        required
        className="max-w-md"
      />

      <Button
        type="submit"
        color="primary"
        isLoading={loading}
        className="w-full max-w-md"
      >
        {loading ? "Updating..." : "Update Profile"}
      </Button>
    </form>
  );
};
