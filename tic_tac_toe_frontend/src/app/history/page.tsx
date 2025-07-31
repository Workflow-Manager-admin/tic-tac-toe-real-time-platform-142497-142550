"use client";
import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { GameState } from "@/lib/models";

export default function HistoryPage() {
  const [games, setGames] = useState<GameState[]>([]);
  const [loading, setLoading] = useState(true);
  const access_token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await apiFetch<GameState[]>("/game/history", {
          headers: { Authorization: `Bearer ${access_token}` }
        });
        setGames(data);
      } catch {
        setGames([]);
      }
      setLoading(false);
    };
    fetchHistory();
    // Including access_token to satisfy exhaustive-deps warning, safe since it resets handler when token changes
  }, [access_token]);

  return (
    <div className="min-h-screen flex flex-col items-center pt-12 px-2 bg-[var(--background)]">
      <div className="bg-[var(--color-primary)] rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-5">
          Move History & Past Games
        </h2>
        {loading ? (
          <div className="animate-spin h-8 w-8 border-4 rounded-full border-[var(--color-accent)] border-t-transparent m-auto" />
        ) : (
          <ul className="divide-y divide-[var(--color-secondary)]/20">
            {games.length === 0 && (
              <li className="text-[var(--color-secondary)] opacity-70 py-4">
                No game history found.
              </li>
            )}
            {games.map((g) => (
              <li key={g.id} className="flex justify-between items-center py-4">
                <span className="text-[var(--color-secondary)]">
                  <b>
                    {new Date(g.created_at).toLocaleDateString()} |{" "}
                    {g.status === "WIN"
                      ? `Winner: ${g.winner}`
                      : g.status === "DRAW"
                      ? "Draw"
                      : "Incomplete"}
                  </b>
                  <span className="ml-3 opacity-70 text-xs">
                    {g.moves && `${g.moves.length} moves`}
                  </span>
                </span>
                {/* Future: Review link for [g.id] */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
