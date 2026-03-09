"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Player,
  GameConfig,
  MatchState,
  FIELD_SIZES,
  POSITION_GROUP_COLORS,
} from "@/lib/types";
import {
  performSubstitution,
  undoLastSubstitution,
  getPlayerPlayedSeconds,
  formatTime,
  getNextSubSuggestion,
} from "@/lib/engine";
import { useLanguage } from "@/lib/LanguageContext";

interface LiveDashboardProps {
  players: Player[];
  config: GameConfig;
  matchState: MatchState;
  onMatchStateChange: (state: MatchState) => void;
  onEndMatch: () => void;
}

export default function LiveDashboard({ players, config, matchState, onMatchStateChange, onEndMatch }: LiveDashboardProps) {
  const { t } = useLanguage();
  const fieldSize = FIELD_SIZES[config.competitionType];
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [selectedOutId, setSelectedOutId] = useState<string | null>(null);
  const [selectedInId, setSelectedInId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalGameSeconds = config.gameLengthMinutes * 60;
  const elapsed = matchState.elapsedSeconds;

  const activeBenchPlayers = matchState.benchIds
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is Player => !!p && !p.isInjured && !p.isGK);

  const sortedBench = [...activeBenchPlayers].sort((a, b) =>
    getPlayerPlayedSeconds(matchState.playerStates[a.id], elapsed) -
    getPlayerPlayedSeconds(matchState.playerStates[b.id], elapsed)
  );

  const suggestion = getNextSubSuggestion(matchState, players);

  // Auto-apply suggestion when no manual selection is active
  const effectiveOutId = selectedOutId ?? suggestion?.outId ?? null;
  const effectiveInId = selectedInId ?? suggestion?.inId ?? null;

  const tick = useCallback(() => {
    onMatchStateChange({ ...matchState, elapsedSeconds: matchState.elapsedSeconds + 1 });
  }, [matchState, onMatchStateChange]);

  useEffect(() => {
    if (matchState.isRunning && !matchState.isPaused) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [matchState.isRunning, matchState.isPaused, tick]);

  useEffect(() => {
    if (elapsed >= totalGameSeconds && matchState.isRunning) {
      onMatchStateChange({ ...matchState, isRunning: false });
    }
  }, [elapsed, totalGameSeconds, matchState, onMatchStateChange]);

  // Vibrate when any on-field player exceeds their rotation interval
  const lastVibrateRef = useRef(0);
  useEffect(() => {
    if (!config.subAlerts || !matchState.isRunning || matchState.isPaused) return;
    if (sortedBench.length === 0) return;

    const now = Date.now();
    if (now - lastVibrateRef.current < 15000) return;

    const hasSubReady = matchState.onFieldIds.some((id) => {
      const p = players.find((pl) => pl.id === id);
      const ps = matchState.playerStates[id];
      if (!p || p.isGK || !ps || ps.currentStintStart === null) return false;
      return (elapsed - ps.currentStintStart) >= ps.rotationIntervalSeconds;
    });

    if (hasSubReady) {
      lastVibrateRef.current = now;
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [elapsed, config.subAlerts, matchState, players, sortedBench.length]);

  function togglePause() { onMatchStateChange({ ...matchState, isPaused: !matchState.isPaused, isRunning: true }); }
  function startMatch() { onMatchStateChange({ ...matchState, isRunning: true, isPaused: false }); }

  function handleConfirmSub() {
    if (!effectiveOutId || !effectiveInId) return;
    onMatchStateChange(performSubstitution(matchState, effectiveOutId, effectiveInId));
    setSelectedOutId(null);
    setSelectedInId(null);
  }

  function handleQuickSub(outId: string, inId: string) {
    onMatchStateChange(performSubstitution(matchState, outId, inId));
    setSelectedOutId(null);
    setSelectedInId(null);
  }

  function handleUndo() {
    onMatchStateChange(undoLastSubstitution(matchState));
    setSelectedOutId(null);
    setSelectedInId(null);
  }

  function handleInjury(id: string) {
    if (sortedBench.length === 0) return;
    onMatchStateChange(performSubstitution(matchState, id, sortedBench[0].id));
  }

  function toggleSelectOut(id: string) {
    setSelectedOutId(prev => prev === id ? null : id);
  }

  function toggleSelectIn(id: string) {
    setSelectedInId(prev => prev === id ? null : id);
  }

  const onFieldPlayers = matchState.onFieldIds.map((id) => players.find((p) => p.id === id)).filter((p): p is Player => !!p);
  const benchPlayersAll = matchState.benchIds.map((id) => players.find((p) => p.id === id)).filter((p): p is Player => !!p);
  const rotationInterval = Object.values(matchState.playerStates)[0]?.rotationIntervalSeconds ?? totalGameSeconds;

  const hasPendingSub = effectiveOutId && effectiveInId;
  const outPlayer = effectiveOutId ? players.find(p => p.id === effectiveOutId) : null;
  const inPlayer = effectiveInId ? players.find(p => p.id === effectiveInId) : null;

  return (
    <div className="flex flex-col gap-5 pb-28 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-accent shrink-0">⚽</span>
          <h1 className="text-lg sm:text-xl font-bold text-text-primary truncate">{t("live.title")}</h1>
        </div>
        <button onClick={() => setShowEndConfirm(true)} className="shrink-0 rounded-xl border border-danger/50 bg-danger/10 px-3 sm:px-4 py-2 text-xs font-bold text-danger hover:bg-danger/20 active:bg-danger/25 transition">
          {t("live.endMatch")}
        </button>
      </div>

      {showEndConfirm && (
        <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4">
          <p className="text-sm font-medium text-text-primary mb-3">{t("live.endConfirm")}</p>
          <div className="flex gap-2">
            <button onClick={() => { onEndMatch(); setShowEndConfirm(false); }} className="flex-1 rounded-xl bg-danger py-2 text-sm font-bold text-white">{t("live.endConfirmYes")}</button>
            <button onClick={() => setShowEndConfirm(false)} className="flex-1 rounded-xl bg-bg-elevated py-2 text-sm font-semibold text-text-secondary">{t("roster.cancel")}</button>
          </div>
        </div>
      )}

      {/* Live Clock */}
      <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">{t("live.liveClock")}</p>
            <p className="text-4xl sm:text-5xl font-bold text-text-primary tabular-nums tracking-tight">{formatTime(elapsed)}</p>
            <p className="text-xs text-text-muted mt-1">{matchState.half === 1 ? t("live.1stHalf") : t("live.2ndHalf")}</p>
          </div>
          <div className="flex flex-col gap-2">
            {!matchState.isRunning ? (
              <button onClick={startMatch} className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-bg-primary shadow-lg shadow-accent/20 active:scale-95">
                <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </button>
            ) : (
              <button onClick={togglePause} className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-lg active:scale-95 ${matchState.isPaused ? "bg-accent text-bg-primary shadow-accent/20" : "bg-bg-elevated text-text-primary shadow-black/10"}`}>
                {matchState.isPaused ? (
                  <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                ) : (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                )}
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated">
          <div className="h-full rounded-full bg-accent transition-all duration-1000" style={{ width: `${Math.min((elapsed / totalGameSeconds) * 100, 100)}%` }} />
        </div>
      </div>

      {/* Suggested Sub Banner */}
      {hasPendingSub && sortedBench.length > 0 && (
        <div className="rounded-2xl border-2 border-accent/40 bg-accent/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-3">{t("live.suggestedSub")}</p>
          <div className="flex items-center gap-3 mb-3">
            {/* Player Out */}
            <div className="flex-1 flex items-center gap-2 rounded-xl bg-danger/10 border border-danger/20 p-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ backgroundColor: outPlayer ? POSITION_GROUP_COLORS[outPlayer.positionGroup] + "20" : "#333", color: outPlayer ? POSITION_GROUP_COLORS[outPlayer.positionGroup] : "#999" }}>
                {outPlayer?.name[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{outPlayer?.name ?? "—"}</p>
                <p className="text-[10px] text-danger">▼ {t("live.out")}</p>
              </div>
            </div>

            <svg className="h-5 w-5 shrink-0 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>

            {/* Player In */}
            <div className="flex-1 flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/20 p-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ backgroundColor: inPlayer ? POSITION_GROUP_COLORS[inPlayer.positionGroup] + "20" : "#333", color: inPlayer ? POSITION_GROUP_COLORS[inPlayer.positionGroup] : "#999" }}>
                {inPlayer?.name[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{inPlayer?.name ?? "—"}</p>
                <p className="text-[10px] text-accent">▲ {t("live.in")}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleConfirmSub}
              className="flex-1 rounded-xl bg-accent py-3 text-sm font-bold text-bg-primary active:scale-[0.98] transition"
            >
              {t("live.confirmSub")}
            </button>
            {(selectedOutId || selectedInId) && (
              <button
                onClick={() => { setSelectedOutId(null); setSelectedInId(null); }}
                className="rounded-xl bg-bg-elevated px-4 py-3 text-sm font-medium text-text-secondary active:scale-95 transition"
              >
                {t("live.resetSelection")}
              </button>
            )}
          </div>
        </div>
      )}

      {/* On Field */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-text-primary">{t("live.onField")}</h2>
            <span className="rounded-md bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent">{matchState.onFieldIds.length}/{fieldSize}</span>
          </div>
          <p className="text-xs text-text-muted">{t("live.rotationInterval", { time: formatTime(rotationInterval) })}</p>
        </div>
        <div className="space-y-3">
          {onFieldPlayers.map((player) => {
            const pState = matchState.playerStates[player.id];
            const played = getPlayerPlayedSeconds({ ...pState, isOnField: true, playerId: player.id }, elapsed);
            const currentStint = pState.currentStintStart !== null ? elapsed - pState.currentStintStart : 0;
            const progress = rotationInterval > 0 ? Math.min(1, currentStint / rotationInterval) : 0;
            const isSubReady = !player.isGK && currentStint >= rotationInterval && sortedBench.length > 0;
            const isSelected = effectiveOutId === player.id;
            const isSuggested = suggestion?.outId === player.id && !selectedOutId;
            const neverSubbed = pState.subCount === 0;

            return (
              <div
                key={player.id}
                onClick={() => { if (!player.isGK) toggleSelectOut(player.id); }}
                className={`rounded-2xl border p-3.5 sm:p-4 transition cursor-pointer ${
                  isSelected
                    ? "border-danger/60 bg-danger/5 ring-1 ring-danger/30"
                    : isSubReady
                      ? "border-accent/60 bg-accent/5 pulse-glow"
                      : "border-border-color bg-bg-card hover:bg-bg-card-hover"
                } ${player.isGK ? "cursor-default opacity-80" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full text-base font-bold"
                      style={{
                        backgroundColor: POSITION_GROUP_COLORS[player.positionGroup] + "20",
                        color: POSITION_GROUP_COLORS[player.positionGroup],
                        border: `2px solid ${POSITION_GROUP_COLORS[player.positionGroup]}50`,
                      }}
                    >
                      {player.name[0]?.toUpperCase()}
                    </div>
                    {player.isGK && (
                      <div className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-gk text-[8px]">🔒</div>
                    )}
                    {/* Sub count badge */}
                    {pState.subCount > 0 && (
                      <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-bg-primary">
                        {pState.subCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {player.name}
                        {player.isGK && <span className="text-text-muted font-normal"> (GK)</span>}
                      </p>
                      {neverSubbed && !player.isGK && (
                        <span className="shrink-0 rounded-full bg-warning/15 px-2 py-0.5 text-[9px] font-bold text-warning">{t("live.noSubs")}</span>
                      )}
                      {isSubReady && (
                        <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">{t("live.subReady")}</span>
                      )}
                      {isSuggested && !isSubReady && (
                        <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-bold text-accent/70">{t("live.suggested")}</span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted tabular-nums">
                      {formatTime(currentStint)} / {formatTime(rotationInterval)}
                      <span className="text-text-muted/50"> · </span>
                      {t("live.totalPlayed", { time: formatTime(played) })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!player.isGK && sortedBench.length > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleQuickSub(player.id, sortedBench[0].id); }}
                        className={`min-h-[36px] rounded-xl px-3 py-2 text-xs font-bold transition active:scale-95 ${isSubReady ? "bg-accent text-bg-primary" : "bg-bg-elevated text-text-secondary hover:bg-bg-card-hover"}`}
                      >
                        {isSubReady ? t("live.subNow") : t("live.sub")}
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleInjury(player.id); }} className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger/10 text-danger text-xs hover:bg-danger/20 active:bg-danger/25 transition" title="Injury">
                      🚑
                    </button>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${player.isGK ? "bg-gk" : isSubReady ? "bg-accent" : "bg-accent/60"}`}
                    style={{ width: `${Math.min(progress * 100, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bench */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <h2 className="text-base font-semibold text-text-primary">{t("live.bench")}</h2>
          <span className="rounded-md bg-bg-elevated px-2 py-0.5 text-xs font-bold text-text-muted">{benchPlayersAll.length}</span>
        </div>
        {benchPlayersAll.length === 0 ? (
          <p className="text-sm text-text-muted px-1">{t("live.noBench")}</p>
        ) : (
          <div className="space-y-3">
            {benchPlayersAll.map((player) => {
              const pState = matchState.playerStates[player.id];
              if (!pState) return null;
              const played = getPlayerPlayedSeconds(pState, elapsed);
              const restStart = pState.currentStintStart === null && pState.totalSecondsPlayed > 0
                ? elapsed - pState.totalSecondsPlayed
                : 0;
              const isSelected = effectiveInId === player.id;
              const isSuggested = suggestion?.inId === player.id && !selectedInId;
              const neverSubbed = pState.subCount === 0;

              return (
                <div
                  key={player.id}
                  onClick={() => { if (!player.isInjured) toggleSelectIn(player.id); }}
                  className={`flex items-center justify-between rounded-2xl border p-4 transition cursor-pointer ${
                    isSelected
                      ? "border-accent/60 bg-accent/5 ring-1 ring-accent/30"
                      : "border-border-color bg-bg-card hover:bg-bg-card-hover"
                  } ${player.isInjured ? "cursor-default opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${neverSubbed ? "opacity-100" : "opacity-60"}`}
                        style={{ backgroundColor: POSITION_GROUP_COLORS[player.positionGroup] + "15", color: POSITION_GROUP_COLORS[player.positionGroup] }}
                      >
                        {player.name[0]?.toUpperCase()}
                      </div>
                      {pState.subCount > 0 && (
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-bg-primary">
                          {pState.subCount}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary">{player.name}</p>
                        {neverSubbed && (
                          <span className="shrink-0 rounded-full bg-warning/15 px-2 py-0.5 text-[9px] font-bold text-warning">{t("live.noSubs")}</span>
                        )}
                        {isSuggested && (
                          <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-bold text-accent/70">{t("live.suggested")}</span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted uppercase tracking-wider tabular-nums">
                        {player.isInjured
                          ? t("roster.injured")
                          : played > 0
                            ? t("live.played", { time: formatTime(played) })
                            : t("live.waitingForSub")}
                        {pState.subCount > 0 && (
                          <span className="text-text-muted/50"> · {t("live.subRate", { count: pState.subCount })}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {matchState.substitutionLog.length > 0 && (
          <button onClick={handleUndo} className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-border-color bg-bg-card px-4 py-3 text-sm font-medium text-text-secondary hover:bg-bg-card-hover transition w-full">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            {t("live.undoSub")}
          </button>
        )}
      </div>
    </div>
  );
}
