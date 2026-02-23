"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Player,
  Position,
  CompetitionType,
  POSITIONS_BY_TYPE,
  FIELD_SIZES,
} from "@/lib/types";

interface PlayerRosterProps {
  players: Player[];
  competitionType: CompetitionType;
  gameLengthMinutes: number;
  onChange: (players: Player[]) => void;
}

export default function PlayerRoster({
  players,
  competitionType,
  gameLengthMinutes,
  onChange,
}: PlayerRosterProps) {
  const positions = POSITIONS_BY_TYPE[competitionType];
  const fieldSize = FIELD_SIZES[competitionType];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Player>>({});

  const activePlayers = players.filter((p) => !p.isInjured);
  const gkCount = activePlayers.filter((p) => p.isGK).length;

  function addPlayer() {
    const defaultPosition = positions.includes("CM") ? "CM" : positions[0];
    const newPlayer: Player = {
      id: uuidv4(),
      name: "",
      position: defaultPosition,
      desiredMinutes: null,
      isInjured: false,
      isGK: false,
    };
    onChange([...players, newPlayer]);
    setEditingId(newPlayer.id);
    setDraft(newPlayer);
  }

  function saveEdit() {
    if (!editingId) return;
    onChange(
      players.map((p) =>
        p.id === editingId ? { ...p, ...draft, isGK: draft.position === "GK" } : p
      )
    );
    setEditingId(null);
    setDraft({});
  }

  function cancelEdit() {
    const player = players.find((p) => p.id === editingId);
    if (player && !player.name) {
      onChange(players.filter((p) => p.id !== editingId));
    }
    setEditingId(null);
    setDraft({});
  }

  function startEdit(player: Player) {
    setEditingId(player.id);
    setDraft({ ...player });
  }

  function removePlayer(id: string) {
    onChange(players.filter((p) => p.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setDraft({});
    }
  }

  function toggleInjured(id: string) {
    onChange(
      players.map((p) => (p.id === id ? { ...p, isInjured: !p.isInjured } : p))
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Players</h2>
          <p className="text-sm text-gray-500">
            {activePlayers.length} active &middot; {fieldSize} on field
          </p>
        </div>
        <button
          onClick={addPlayer}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
        >
          + Add Player
        </button>
      </div>

      {players.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <div className="mb-2 text-4xl">&#9917;</div>
          <p className="text-sm text-gray-500">
            No players yet. Add players to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={`rounded-xl border p-4 transition ${
                player.isInjured
                  ? "border-red-200 bg-red-50"
                  : "border-gray-100 bg-gray-50 hover:border-gray-200"
              }`}
            >
              {editingId === player.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">
                        Name
                      </label>
                      <input
                        type="text"
                        autoFocus
                        value={draft.name ?? ""}
                        onChange={(e) =>
                          setDraft({ ...draft, name: e.target.value })
                        }
                        onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                        placeholder="Player name"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">
                        Position
                      </label>
                      <select
                        value={draft.position ?? positions[0]}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            position: e.target.value as Position,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                      >
                        {positions.map((pos) => (
                          <option
                            key={pos}
                            value={pos}
                            disabled={
                              pos === "GK" &&
                              gkCount >= 1 &&
                              player.position !== "GK"
                            }
                          >
                            {pos}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">
                        Minutes (blank = equal share)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={gameLengthMinutes}
                        value={draft.desiredMinutes ?? ""}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            desiredMinutes: e.target.value
                              ? parseInt(e.target.value)
                              : null,
                          })
                        }
                        placeholder="Auto"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={!draft.name?.trim()}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {player.name || "Unnamed"}
                        {player.isInjured && (
                          <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600">
                            Injured
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {player.position}
                        {player.desiredMinutes
                          ? ` · ${player.desiredMinutes} min`
                          : " · Equal share"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(player)}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
                      title="Edit"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleInjured(player.id)}
                      className={`rounded-lg p-2 transition ${
                        player.isInjured
                          ? "text-red-500 hover:bg-red-100"
                          : "text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                      }`}
                      title={player.isInjured ? "Mark fit" : "Mark injured"}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                      title="Remove"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
