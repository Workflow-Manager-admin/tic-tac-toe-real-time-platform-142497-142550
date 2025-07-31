"use client";
import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { User } from "@/lib/models";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const access_token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await apiFetch<User>("/auth/me", {
          headers: { Authorization: `Bearer ${access_token}` }
        });
        setUser(data);
      } catch {
        setUser(null);
      }
      setLoading(false);
    };
    fetchProfile();
    // Including access_token to satisfy exhaustive-deps warning
  }, [access_token]);

  const handleLogout = async () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 rounded-full border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--color-secondary)]">
        <div>
          <p>User not found. Please <a className="text-[var(--color-accent)] underline" href="/auth">login</a>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)]">
      <div className="max-w-md bg-[var(--color-primary)] shadow-md rounded-lg p-8 w-full">
        <h2 className="text-xl font-bold text-[var(--color-secondary)] mb-6">
          Profile
        </h2>
        <div className="space-y-4 text-[var(--color-secondary)]">
          <div>
            <span className="font-medium">Username: </span> {user.username}
          </div>
          <div>
            <span className="font-medium">Email: </span> {user.email}
          </div>
          <div>
            <span className="font-medium">Joined: </span> {new Date(user.created_at).toLocaleDateString()}
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded bg-[var(--color-accent)] text-[var(--color-secondary)] font-bold hover:bg-[var(--color-secondary)] hover:text-[var(--color-accent)] border-2 border-[var(--color-accent)] transition"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
