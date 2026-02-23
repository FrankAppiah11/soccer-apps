"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Player,
  Position,
  PositionGroup,
  GameConfig,
  POSITIONS_BY_TYPE,
  FIELD_SIZES,
  getPositionGroup,
  POSITION_GROUP_COLORS,
} from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

interface PlayerRosterProps {
  players: Player[];
  config: GameConfig;
  onChange: (players: Player[]) => void;
}

const FILTER_TABS: { key: TranslationKey; value: PositionGroup | "ALL" }[] = [
  { key: "roster.allPlayers", value: "ALL" },
  { key: "roster.forward", value: "FW" },
  { key: "roster.midfield", value: "MID" },
  { key: "roster.defense", value: "DEF" },
];

function PositionBadge({ group }: { group: PositionGroup }) {
  const color = POSITION_GROUP_COLORS[group];
  return (
    <span
      className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase"
      style={{ backgroundColor: color + "25", color }}
    >
      {group}
    </span>
  );
}

export default function PlayerRoster({ players, config, onChange }: PlayerRosterProps) {
  const { t } = useLanguage();
  const positions = POSITIONS_BY_TYPE[config.competitionType];
  const fieldSize = FIELD_SIZES[config.competitionType];
  const [filter, setFilter] = useState<PositionGroup | "ALL">("ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Player>>({});

  const activePlayers = players.filter((p) => !p.isInjured && p.name.trim());
  const gkCount = players.filter((p) => p.isGK).length;
  const avgMinutes = activePlayers.length > 0
    ? Math.round((config.gameLengthMinutes * fieldSize) / activePlayers.length)
    : 0;

  const filtered = filter === "ALL" ? players : players.filter((p) => p.positionGroup === filter);

  function addPlayer() {
    const defaultPos: Position = positions.includes("CM") ? "CM" : positions[0];
    const newPlayer: Player = {
      id: uuidv4(), name: "", position: defaultPos,
      positionGroup: getPositionGroup(defaultPos),
      desiredMinutes: null, isInjured: false, isGK: false,
    };
    onChange([...players, newPlayer]);
    setEditingId(newPlayer.id);
    setDraft(newPlayer);
  }

  function saveEdit() {
    if (!editingId || !draft.name?.trim()) return;
    const pos = (draft.position ?? "CM") as Position;
    const group = getPositionGroup(pos);
    onChange(players.map((p) =>
      p.id === editingId
        ? { ...p, ...draft, position: pos, positionGroup: group, isGK: pos === "GK" }
        : p
    ));
    setEditingId(null);
    setDraft({});
  }

  function cancelEdit() {
    const player = players.find((p) => p.id === editingId);
    if (player && !player.name) onChange(players.filter((p) => p.id !== editingId));
    setEditingId(null);
    setDraft({});
  }

  function startEdit(player: Player) { setEditingId(player.id); setDraft({ ...player }); }

  function removePlayer(id: string) {
    onChange(players.filter((p) => p.id !== id));
    if (editingId === id) { setEditingId(null); setDraft({}); }
  }

  function toggleGK(id: string) {
    onChange(players.map((p) => {
      if (p.id !== id) return p;
      const newIsGK = !p.isGK;
      return { ...p, isGK: newIsGK, position: newIsGK ? ("GK" as Position) : ("CM" as Position), positionGroup: newIsGK ? ("GK" as PositionGroup) : ("MID" as PositionGroup) };
    }));
  }

  function toggleInjured(id: string) {
    onChange(players.map((p) => (p.id === id ? { ...p, isInjured: !p.isInjured } : p)));
  }

  return (
    <div className="flex flex-col gap-4 pb-28 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-accent text-lg">⚽</span>
          <h1 className="text-xl font-bold text-text-primary">{t("roster.title")}</h1>
        </div>
        <button onClick={() => onChange([])} className="text-sm font-semibold text-accent hover:text-accent-dim transition">
          {t("roster.resetAll")}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="-mx-4 px-4 sm:-mx-5 sm:px-5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold transition active:scale-95 ${
                filter === tab.value
                  ? "bg-accent text-bg-primary"
                  : "bg-bg-card text-text-secondary border border-border-color hover:bg-bg-card-hover"
              }`}
            >
              {t(tab.key)}
            </button>
          ))}
          <div className="shrink-0 w-4" aria-hidden="true" />
        </div>
      </div>

      {/* Squad info */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {t("roster.matchSquad")} ({activePlayers.length})
        </p>
        {activePlayers.length > 0 && (
          <p className="text-xs font-semibold text-accent">
            {t("roster.avgPerPlayer", { min: avgMinutes })}
          </p>
        )}
      </div>

      {/* Player list */}
      {filtered.length === 0 && players.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-color py-16 text-center">
          <p className="text-4xl mb-3">⚽</p>
          <p className="text-sm text-text-secondary">{t("roster.noPlayers")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((player) => (
            <div key={player.id} className="animate-slide-up">
              {editingId === player.id ? (
                <div className="rounded-2xl border border-accent/40 bg-bg-card p-3.5 sm:p-4 space-y-3">
                  <input
                    type="text" autoFocus placeholder={t("roster.playerName")}
                    value={draft.name ?? ""}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    className="w-full rounded-xl border border-border-color bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-text-muted">{t("roster.position")}</label>
                      <select
                        value={draft.position ?? positions[0]}
                        onChange={(e) => setDraft({ ...draft, position: e.target.value as Position })}
                        className="w-full rounded-xl border border-border-color bg-bg-elevated px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                      >
                        {positions.map((pos) => (
                          <option key={pos} value={pos} disabled={pos === "GK" && gkCount >= 1 && player.position !== "GK"}>
                            {pos}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-text-muted">{t("roster.targetMinutes")}</label>
                      <input
                        type="number" min={1} max={config.gameLengthMinutes}
                        value={draft.desiredMinutes ?? ""}
                        onChange={(e) => setDraft({ ...draft, desiredMinutes: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder={t("roster.auto")}
                        className="w-full rounded-xl border border-border-color bg-bg-elevated px-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={!draft.name?.trim()} className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-bg-primary disabled:opacity-40">
                      {t("roster.save")}
                    </button>
                    <button onClick={cancelEdit} className="flex-1 rounded-xl bg-bg-elevated py-2.5 text-sm font-semibold text-text-secondary">
                      {t("roster.cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`rounded-2xl border bg-bg-card p-4 transition hover:bg-bg-card-hover ${player.isInjured ? "border-danger/40" : "border-border-color"}`}>
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
                        style={{
                          backgroundColor: POSITION_GROUP_COLORS[player.positionGroup] + "20",
                          color: POSITION_GROUP_COLORS[player.positionGroup],
                          border: `2px solid ${POSITION_GROUP_COLORS[player.positionGroup]}60`,
                        }}
                      >
                        {player.name ? player.name[0].toUpperCase() : "?"}
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        <PositionBadge group={player.positionGroup} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {player.name || t("roster.unnamed")}
                      </p>
                      {player.isGK ? (
                        <p className="text-xs font-semibold text-gk flex items-center gap-1">{t("roster.primaryKeeper")}</p>
                      ) : (
                        <p className="text-xs text-text-muted flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t("roster.target", { min: player.desiredMinutes ?? config.gameLengthMinutes })}
                        </p>
                      )}
                      {player.isInjured && (
                        <p className="text-xs font-semibold text-danger mt-0.5">{t("roster.injured")}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-center">
                        <button
                          onClick={() => toggleGK(player.id)}
                          disabled={!player.isGK && gkCount >= 1}
                          className={`relative h-7 w-12 rounded-full transition-colors ${player.isGK ? "bg-gk" : "bg-bg-elevated"} disabled:opacity-30`}
                        >
                          <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${player.isGK ? "translate-x-5.5" : "translate-x-0.5"}`} />
                          {player.isGK && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gk text-[8px] text-white font-bold">🧤</span>
                          )}
                        </button>
                        <p className="text-[9px] text-text-muted mt-1 uppercase tracking-wider">
                          {player.isGK ? t("roster.gkActive") : t("roster.gkStatus")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-2 pt-2 border-t border-border-color/50">
                    <button onClick={() => startEdit(player)} className="min-h-[36px] rounded-lg px-3 py-2 text-xs font-medium text-text-secondary hover:text-accent hover:bg-accent/10 active:bg-accent/15 transition">
                      {t("roster.edit")}
                    </button>
                    <button
                      onClick={() => toggleInjured(player.id)}
                      className={`min-h-[36px] rounded-lg px-3 py-2 text-xs font-medium transition ${player.isInjured ? "text-danger hover:bg-danger/10 active:bg-danger/15" : "text-text-secondary hover:text-warning hover:bg-warning/10 active:bg-warning/15"}`}
                    >
                      {player.isInjured ? t("roster.markFit") : t("roster.injury")}
                    </button>
                    <button onClick={() => removePlayer(player.id)} className="min-h-[36px] rounded-lg px-3 py-2 text-xs font-medium text-text-secondary hover:text-danger hover:bg-danger/10 active:bg-danger/15 transition">
                      {t("roster.remove")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={addPlayer}
        className="fixed z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-bg-primary shadow-lg shadow-accent/30 transition hover:bg-accent-dim active:scale-90"
        style={{ bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))", right: "1.25rem" }}
      >
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 8v4m2-2h-4" />
        </svg>
      </button>
    </div>
  );
}
