"use client";
import React, { useState } from "react";
import { apiFetch } from "@/lib/api";
import { AuthResponse } from "@/lib/models";
import { useRouter } from "next/navigation";

type Mode = "login" | "signup";

// PUBLIC_INTERFACE
export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      let data: AuthResponse;
      if (mode === "login") {
        data = await apiFetch<AuthResponse>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        });
      } else {
        data = await apiFetch<AuthResponse>("/auth/signup", {
          method: "POST",
          body: JSON.stringify({ username, email, password }),
        });
      }
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/game");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Authentication failed");
      } else {
        setError("Authentication failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <form
        onSubmit={handleAuth}
        className="flex flex-col gap-5 bg-[var(--color-primary)] p-8 rounded-lg shadow-lg min-w-[340px]"
      >
        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-2 text-center">
          {mode === "login" ? "Sign In" : "Sign Up"}
        </h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          className="rounded px-3 py-2 bg-[var(--background)] text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        {mode === "signup" && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            className="rounded px-3 py-2 bg-[var(--background)] text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
        <input
          type="password"
          placeholder="Password"
          value={password}
          className="rounded px-3 py-2 bg-[var(--background)] text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <div className="text-[var(--color-accent)] text-sm text-center">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="bg-[var(--color-accent)] text-[var(--color-secondary)] py-2 rounded font-bold hover:bg-[var(--color-secondary)] hover:text-[var(--color-accent)] border-2 border-[var(--color-accent)] transition"
        >
          {mode === "login" ? "Sign In" : "Sign Up"}
        </button>
        <div className="flex justify-between text-xs text-[var(--color-secondary)] mt-3">
          <span>
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>
          <button
            type="button"
            className="underline ml-2 text-[var(--color-accent)]"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}
