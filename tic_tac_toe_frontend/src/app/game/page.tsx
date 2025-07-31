"use client";
import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { GameState, Move } from "@/lib/models";

export default function GamePage() {
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const access_token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  // Fetch active or last played game on mount
  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      try {
        const data = await apiFetch<GameState>("/game/active", {
          headers: { Authorization: `Bearer ${access_token}` }
        });
        setGame(data);
      } catch {
        // If no active game, create one
        try {
          const newGame = await apiFetch<GameState>("/game/new", {
            method: "POST",
            headers: { Authorization: `Bearer ${access_token}` }
          });
          setGame(newGame);
        } catch (err: unknown) {
          if (err instanceof Error) {
            setActionMsg(err.message || "Error loading game");
          } else {
            setActionMsg("Error loading game");
          }
        }
      }
      setLoading(false);
    };
    fetchGame();
    // eslint-disable-next-line
  }, []);

  // Make a move
  const handleCellClick = async (row: number, col: number) => {
    if (!game || game.status !== "IN_PROGRESS") return;
    if (game.board[row][col]) return;

    setMoveError(null);
    try {
      const updated = await apiFetch<GameState>(`/game/${game.id}/move`, {
        method: "POST",
        headers: { Authorization: `Bearer ${access_token}` },
        body: JSON.stringify({ row, col }),
      });
      setGame(updated);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMoveError(err.message || "Invalid move.");
      } else {
        setMoveError("Invalid move.");
      }
    }
  };

  // Restart the current game
  const handleRestart = async () => {
    if (!game) return;
    try {
      const restarted = await apiFetch<GameState>(`/game/${game.id}/restart`, {
        method: "POST",
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setGame(restarted);
      setMoveError(null);
      setActionMsg("Game restarted.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionMsg(err.message || "Error restarting game");
      } else {
        setActionMsg("Error restarting game");
      }
    }
  };

  // New game, navigates or replaces state
  const handleNewGame = async () => {
    try {
      const newGame = await apiFetch<GameState>("/game/new", {
        method: "POST",
        headers: { Authorization: `Bearer ${access_token}` }
      });
      setGame(newGame);
      setMoveError(null);
      setActionMsg("Started a new game!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionMsg(err.message || "Error creating new game");
      } else {
        setActionMsg("Error creating new game");
      }
    }
  };

  // Renders the main game board
  function renderBoard(board: ("X" | "O" | null)[][], disabled: boolean) {
    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-2 md:gap-4 max-w-[320px] aspect-square w-full bg-[var(--color-primary)] rounded-lg p-3 shadow-lg">
        {board.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <button
              key={`${rIdx}-${cIdx}`}
              disabled={Boolean(cell) || disabled}
              className={`flex items-center justify-center text-3xl md:text-5xl font-bold aspect-square bg-[var(--background)] rounded-lg border-2 transition hover:border-[var(--color-accent)] ${
                cell === "X"
                  ? "text-[var(--color-accent)]"
                  : cell === "O"
                  ? "text-[var(--color-secondary)]"
                  : "text-[var(--color-primary)]"
              }`}
              style={{
                borderColor: cell
                  ? cell === "X"
                    ? "var(--color-accent)"
                    : "var(--color-secondary)"
                  : "var(--color-primary)",
                cursor: !cell && !disabled ? "pointer" : "not-allowed",
              }}
              onClick={() => handleCellClick(rIdx, cIdx)}
            >
              {cell || ""}
            </button>
          ))
        )}
      </div>
    );
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 rounded-full border-[var(--color-accent)] border-t-transparent" />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-start md:items-stretch justify-center gap-8 bg-[var(--background)] px-2 py-10">
      {/* Left: Game Board and Controls */}
      <section className="flex flex-col gap-6 items-center flex-1">
        <h2 className="text-3xl font-bold text-[var(--color-secondary)] mb-2">
          Tic Tac Toe
        </h2>
        <div>
          {game && renderBoard(game.board, game.status !== "IN_PROGRESS")}
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleRestart}
            className="px-4 py-2 rounded bg-[var(--color-primary)] border-2 border-[var(--color-secondary)] text-[var(--color-secondary)] font-semibold hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)] transition"
          >
            Restart
          </button>
          <button
            onClick={handleNewGame}
            className="px-4 py-2 rounded bg-[var(--color-accent)] border-2 border-[var(--color-accent)] text-[var(--color-secondary)] font-semibold hover:bg-[var(--color-secondary)] hover:text-[var(--color-accent)] transition"
          >
            New Game
          </button>
        </div>
        {game && (
          <div className="p-3 mt-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-secondary)] text-center w-full max-w-[320px]">
            <div>
              <span className="text-lg font-semibold">Game Status: </span>
              <span>
                {game.status === "IN_PROGRESS" && (
                  <>
                    In Progress — Current Turn:{" "}
                    <b
                      className={
                        game.current_turn === "X"
                          ? "text-[var(--color-accent)]"
                          : "text-[var(--color-secondary)]"
                      }
                    >
                      {game.current_turn}
                    </b>
                  </>
                )}
                {game.status === "WIN" && (
                  <b
                    className={
                      game.winner === "X"
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-secondary)]"
                    }
                  >
                    Player {game.winner} wins!
                  </b>
                )}
                {game.status === "DRAW" && <b>Draw Game.</b>}
                {game.status === "WAITING" && <span>Waiting for opponent...</span>}
              </span>
            </div>
          </div>
        )}
        {moveError && (
          <div className="bg-[var(--color-accent)] text-[var(--color-secondary)] rounded p-2 mt-2">
            {moveError}
          </div>
        )}
        {actionMsg && (
          <div className="bg-[var(--color-secondary)] text-[var(--color-primary)] font-semibold rounded p-2 mt-2">
            {actionMsg}
          </div>
        )}
      </section>
      {/* Right: Move History */}
      <aside className="flex-1 max-w-md mx-auto bg-[var(--color-primary)] rounded-lg p-4 min-h-[320px] shadow-md w-full">
        <h3 className="text-lg font-bold text-[var(--color-secondary)] mb-3">
          Move History
        </h3>
        <ol className="list-decimal pl-5 text-[var(--color-secondary)] text-sm">
          {game?.moves && game.moves.length > 0 ? (
            game.moves.map((move: Move, idx: number) => (
              <li key={idx} className="mb-1">
                <span>
                  <span
                    className={
                      move.player === "X"
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-secondary)]"
                    }
                  >
                    {move.player}
                  </span>
                  {": "}
                  Row {move.row + 1}, Col {move.col + 1}
                  <span className="opacity-60 ml-2">
                    ({new Date(move.timestamp).toLocaleTimeString()})
                  </span>
                </span>
              </li>
            ))
          ) : (
            <li className="opacity-60">No moves yet.</li>
          )}
        </ol>
      </aside>
    </div>
  );
}
