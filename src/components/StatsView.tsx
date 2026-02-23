"use client";

import { Player, MatchState, GameConfig, POSITION_GROUP_COLORS } from "@/lib/types";
import { getPlayerPlayedSeconds, formatTime } from "@/lib/engine";
import { useLanguage } from "@/lib/LanguageContext";

interface StatsViewProps {
  players: Player[];
  matchState: MatchState | null;
  config: GameConfig;
}

export default function StatsView({ players, matchState, config }: StatsViewProps) {
  const { t } = useLanguage();

  if (!matchState) {
    return (
      <div className="flex flex-col gap-6 pb-28 animate-slide-up">
        <h1 className="text-xl font-bold text-text-primary px-1">{t("stats.title")}</h1>
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-color py-16 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-sm text-text-secondary">{t("stats.startMatch")}</p>
        </div>
      </div>
    );
  }

  const elapsed = matchState.elapsedSeconds;
  const playerStats = players
    .filter((p) => p.name.trim() && matchState.playerStates[p.id])
    .map((p) => ({ player: p, played: getPlayerPlayedSeconds(matchState.playerStates[p.id], elapsed) }))
    .sort((a, b) => b.played - a.played);

  const maxPlayed = Math.max(...playerStats.map((s) => s.played), 1);
  const totalSubs = matchState.substitutionLog.length;

  return (
    <div className="flex flex-col gap-5 pb-28 animate-slide-up">
      <h1 className="text-xl font-bold text-text-primary px-1">{t("stats.title")}</h1>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl border border-border-color bg-bg-card p-2.5 sm:p-3 text-center">
          <p className="text-lg sm:text-2xl font-bold text-accent tabular-nums">{formatTime(elapsed)}</p>
          <p className="text-[9px] sm:text-[10px] text-text-muted uppercase tracking-wider">{t("stats.elapsed")}</p>
        </div>
        <div className="rounded-xl border border-border-color bg-bg-card p-2.5 sm:p-3 text-center">
          <p className="text-lg sm:text-2xl font-bold text-text-primary tabular-nums">{totalSubs}</p>
          <p className="text-[9px] sm:text-[10px] text-text-muted uppercase tracking-wider">{t("stats.subsMade")}</p>
        </div>
        <div className="rounded-xl border border-border-color bg-bg-card p-2.5 sm:p-3 text-center">
          <p className="text-lg sm:text-2xl font-bold text-text-primary tabular-nums">{playerStats.length}</p>
          <p className="text-[9px] sm:text-[10px] text-text-muted uppercase tracking-wider">{t("stats.players")}</p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text-secondary mb-3 px-1">{t("stats.playTimeDistribution")}</h2>
        <div className="space-y-3">
          {playerStats.map(({ player, played }) => {
            const pct = maxPlayed > 0 ? (played / maxPlayed) * 100 : 0;
            const groupColor = POSITION_GROUP_COLORS[player.positionGroup];
            return (
              <div key={player.id} className="rounded-xl border border-border-color bg-bg-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: groupColor }} />
                    <span className="text-sm font-medium text-text-primary">{player.name}</span>
                    <span className="text-[10px] text-text-muted uppercase">{player.position}</span>
                  </div>
                  <span className="text-xs font-semibold text-text-secondary tabular-nums">{formatTime(played)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-bg-elevated">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: groupColor }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {matchState.substitutionLog.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 px-1">{t("stats.subLog")}</h2>
          <div className="space-y-2">
            {matchState.substitutionLog.map((sub) => {
              const outP = players.find((p) => p.id === sub.playerOutId);
              const inP = players.find((p) => p.id === sub.playerInId);
              return (
                <div key={sub.id} className="flex items-center gap-2 sm:gap-3 rounded-xl border border-border-color bg-bg-card px-3 sm:px-4 py-3">
                  <span className="shrink-0 rounded-full bg-bg-elevated px-2 py-0.5 text-[11px] font-bold text-text-secondary tabular-nums">{formatTime(sub.timestamp)}</span>
                  <span className="text-xs sm:text-sm text-danger font-medium truncate">▼ {outP?.name ?? "?"}</span>
                  <span className="text-xs text-text-muted shrink-0">→</span>
                  <span className="text-xs sm:text-sm text-accent font-medium truncate">▲ {inP?.name ?? "?"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
