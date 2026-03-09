"use client";

import {
  CompetitionType,
  GameConfig,
  FIELD_SIZES,
  estimatePlaytimeDistribution,
} from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";

interface GameSetupProps {
  config: GameConfig;
  onChange: (config: GameConfig) => void;
  onStartMatch: () => void;
  canStart: boolean;
  playerCount: number;
}

const COMPETITION_ORDER: CompetitionType[] = ["3v3", "5v5", "6v6", "11v11"];

const COMP_SUBTITLE_KEYS: Record<CompetitionType, "comp.3v3" | "comp.5v5" | "comp.6v6" | "comp.11v11"> = {
  "3v3": "comp.3v3",
  "5v5": "comp.5v5",
  "6v6": "comp.6v6",
  "11v11": "comp.11v11",
};

export default function GameSetup({
  config,
  onChange,
  onStartMatch,
  canStart,
  playerCount,
}: GameSetupProps) {
  const { t } = useLanguage();
  const fieldSize = FIELD_SIZES[config.competitionType];

  const isCustomRotation = config.rotationIntervalMinutes != null;
  const autoInterval = playerCount > fieldSize
    ? Math.floor(config.gameLengthMinutes / Math.ceil((playerCount) / fieldSize))
    : config.gameLengthMinutes;
  const effectiveInterval = config.rotationIntervalMinutes ?? autoInterval;

  const distribution = estimatePlaytimeDistribution(
    config.gameLengthMinutes,
    config.rotationIntervalMinutes,
    playerCount > 0 ? playerCount + 1 : 0,
    fieldSize
  );

  const maxInterval = config.gameLengthMinutes;

  return (
    <div className="flex flex-col gap-5 pb-28 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h1 className="text-xl font-bold text-text-primary">{t("setup.title")}</h1>
        <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border-color text-text-secondary hover:text-accent transition">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Selected format banner */}
      <div className="rounded-2xl bg-gradient-to-r from-accent/20 to-accent/5 border border-accent/30 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">
          {t("setup.selectedFormat")}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              {config.competitionType} {t("setup.match")}
            </h2>
            <p className="text-sm text-text-secondary">
              {config.gameLengthMinutes} {t("setup.minutesTotal")}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-2xl">
            ⚽
          </div>
        </div>
      </div>

      {/* Competition Type */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <svg className="h-5 w-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
          </svg>
          <h3 className="text-base font-semibold text-text-primary">
            {t("setup.competitionType")}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {COMPETITION_ORDER.map((type) => {
            const isSelected = config.competitionType === type;
            const isDefault = type === "6v6";
            return (
              <button
                key={type}
                onClick={() => onChange({ ...config, competitionType: type })}
                className={`relative rounded-xl border-2 p-3 sm:p-4 text-left transition-all active:scale-[0.98] ${
                  isSelected
                    ? "border-accent bg-accent/10"
                    : "border-border-color bg-bg-card hover:border-border-color/80 hover:bg-bg-card-hover"
                }`}
              >
                {isDefault && (
                  <span className="absolute -top-2.5 left-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-bg-primary">
                    {t("setup.default")}
                  </span>
                )}
                <p className="text-xs text-text-secondary">{t(COMP_SUBTITLE_KEYS[type])}</p>
                <p className="text-lg font-bold text-text-primary">{type}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Match Duration */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-base font-semibold text-text-primary">
              {t("setup.matchDuration")}
            </h3>
          </div>
          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
            {config.gameLengthMinutes} {t("setup.min")}
          </span>
        </div>
        <div className="rounded-2xl border border-border-color bg-bg-card p-4 sm:p-5">
          <div className="flex items-center justify-center gap-5 sm:gap-6 mb-4">
            <button
              onClick={() =>
                onChange({ ...config, gameLengthMinutes: Math.max(5, config.gameLengthMinutes - 5) })
              }
              className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-bg-elevated text-xl font-bold text-text-secondary hover:bg-bg-card-hover hover:text-text-primary transition active:scale-95"
            >
              −
            </button>
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-text-primary tabular-nums">
                {config.gameLengthMinutes}
              </p>
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-text-muted mt-1">
                {t("setup.minutes")}
              </p>
            </div>
            <button
              onClick={() =>
                onChange({ ...config, gameLengthMinutes: Math.min(120, config.gameLengthMinutes + 5) })
              }
              className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-bg-elevated text-xl font-bold text-text-secondary hover:bg-bg-card-hover hover:text-text-primary transition active:scale-95"
            >
              +
            </button>
          </div>
          <input
            type="range"
            min={5}
            max={90}
            step={5}
            value={config.gameLengthMinutes}
            onChange={(e) => onChange({ ...config, gameLengthMinutes: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Rotation Interval */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <h3 className="text-base font-semibold text-text-primary">
              {t("setup.rotationInterval")}
            </h3>
          </div>
          <button
            onClick={() => onChange({
              ...config,
              rotationIntervalMinutes: isCustomRotation ? null : autoInterval,
            })}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              isCustomRotation
                ? "bg-warning/15 text-warning"
                : "bg-accent/15 text-accent"
            }`}
          >
            {isCustomRotation ? t("setup.rotationCustom") : t("setup.rotationAuto")}
          </button>
        </div>

        <div className="rounded-2xl border border-border-color bg-bg-card p-4 sm:p-5">
          <div className="flex items-center justify-center gap-5 sm:gap-6 mb-4">
            <button
              onClick={() => {
                const next = Math.max(1, effectiveInterval - 1);
                onChange({ ...config, rotationIntervalMinutes: next });
              }}
              className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-bg-elevated text-xl font-bold text-text-secondary hover:bg-bg-card-hover hover:text-text-primary transition active:scale-95"
            >
              −
            </button>
            <div className="text-center">
              <p className={`text-4xl sm:text-5xl font-bold tabular-nums ${isCustomRotation ? "text-warning" : "text-text-primary"}`}>
                {effectiveInterval}
              </p>
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-text-muted mt-1">
                {t("setup.minPerRotation")}
              </p>
            </div>
            <button
              onClick={() => {
                const next = Math.min(maxInterval, effectiveInterval + 1);
                onChange({ ...config, rotationIntervalMinutes: next });
              }}
              className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-bg-elevated text-xl font-bold text-text-secondary hover:bg-bg-card-hover hover:text-text-primary transition active:scale-95"
            >
              +
            </button>
          </div>
          <input
            type="range"
            min={1}
            max={maxInterval}
            step={1}
            value={effectiveInterval}
            onChange={(e) =>
              onChange({ ...config, rotationIntervalMinutes: parseInt(e.target.value) })
            }
            className="w-full"
          />
          {isCustomRotation && (
            <button
              onClick={() => onChange({ ...config, rotationIntervalMinutes: null })}
              className="mt-3 w-full rounded-lg bg-bg-elevated py-2 text-xs font-medium text-text-secondary hover:text-text-primary transition"
            >
              {t("setup.resetToAuto")}
            </button>
          )}
        </div>
      </div>

      {/* Play Time Distribution Preview */}
      {playerCount > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-base font-semibold text-text-primary">
              {t("setup.playtimePreview")}
            </h3>
          </div>
          <div className="rounded-2xl border border-border-color bg-bg-card p-4 sm:p-5">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl bg-bg-elevated p-3 text-center">
                <p className="text-lg sm:text-xl font-bold text-accent tabular-nums">
                  {distribution.minutesPerPlayer}
                </p>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-text-muted mt-0.5">
                  {t("setup.minPerPlayer")}
                </p>
              </div>
              <div className="rounded-xl bg-bg-elevated p-3 text-center">
                <p className="text-lg sm:text-xl font-bold text-text-primary tabular-nums">
                  {distribution.totalRotations}
                </p>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-text-muted mt-0.5">
                  {t("setup.rotations")}
                </p>
              </div>
              <div className="rounded-xl bg-bg-elevated p-3 text-center">
                <p className="text-lg sm:text-xl font-bold text-text-primary tabular-nums">
                  {distribution.benchSize}
                </p>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-text-muted mt-0.5">
                  {t("setup.onBench")}
                </p>
              </div>
            </div>

            {/* Per-player bar visualization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] text-text-muted uppercase tracking-wider px-1">
                <span>{t("setup.playerLabel")}</span>
                <span>{t("setup.estPlaytime")}</span>
              </div>

              {/* GK bar — always full game */}
              <div className="flex items-center gap-2.5">
                <span className="w-8 shrink-0 text-[10px] font-bold text-warning text-right">GK</span>
                <div className="flex-1 h-5 rounded-md bg-bg-elevated overflow-hidden">
                  <div
                    className="h-full rounded-md bg-warning/60 transition-all duration-300"
                    style={{ width: "100%" }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-xs font-semibold text-text-secondary tabular-nums">
                  {config.gameLengthMinutes}m
                </span>
              </div>

              {/* Outfield players — show as a group (all equal when equal playtime) */}
              {Array.from({ length: Math.min(playerCount, 12) }, (_, i) => {
                const pct = config.gameLengthMinutes > 0
                  ? Math.min(100, (distribution.minutesPerPlayer / config.gameLengthMinutes) * 100)
                  : 0;
                const isOnField = i < (fieldSize - 1);
                return (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-8 shrink-0 text-[10px] font-bold text-text-muted text-right">
                      P{i + 1}
                    </span>
                    <div className="flex-1 h-5 rounded-md bg-bg-elevated overflow-hidden">
                      <div
                        className={`h-full rounded-md transition-all duration-300 ${isOnField ? "bg-accent/50" : "bg-def/40"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-right text-xs font-semibold text-text-secondary tabular-nums">
                      {distribution.minutesPerPlayer}m
                    </span>
                  </div>
                );
              })}
              {playerCount > 12 && (
                <p className="text-center text-[10px] text-text-muted">
                  +{playerCount - 12} {t("setup.morePlayers")}
                </p>
              )}
            </div>

            {/* Fairness indicator */}
            {distribution.benchSize > 0 && (
              <div className={`mt-4 rounded-lg p-3 text-center text-xs font-medium ${
                distribution.minutesPerPlayer >= config.gameLengthMinutes * 0.5
                  ? "bg-accent/10 text-accent"
                  : distribution.minutesPerPlayer >= config.gameLengthMinutes * 0.3
                    ? "bg-warning/10 text-warning"
                    : "bg-danger/10 text-danger"
              }`}>
                {distribution.minutesPerPlayer >= config.gameLengthMinutes * 0.5
                  ? t("setup.fairnessGood")
                  : distribution.minutesPerPlayer >= config.gameLengthMinutes * 0.3
                    ? t("setup.fairnessOk")
                    : t("setup.fairnessLow")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Rules */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-base font-semibold text-text-primary">{t("setup.quickRules")}</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border-color bg-bg-card p-3.5 sm:p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">{t("setup.equalPlaytime")}</p>
                <p className="text-xs text-text-muted truncate">{t("setup.equalPlaytimeDesc")}</p>
              </div>
            </div>
            <button
              onClick={() => onChange({ ...config, equalPlaytime: !config.equalPlaytime })}
              className={`relative h-7 w-12 shrink-0 ml-3 rounded-full transition-colors ${config.equalPlaytime ? "bg-accent" : "bg-bg-elevated"}`}
            >
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${config.equalPlaytime ? "translate-x-5.5" : "translate-x-0.5"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border-color bg-bg-card p-3.5 sm:p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">{t("setup.subAlerts")}</p>
                <p className="text-xs text-text-muted truncate">{t("setup.subAlertsDesc")}</p>
              </div>
            </div>
            <button
              onClick={() => onChange({ ...config, subAlerts: !config.subAlerts })}
              className={`relative h-7 w-12 shrink-0 ml-3 rounded-full transition-colors ${config.subAlerts ? "bg-accent" : "bg-bg-elevated"}`}
            >
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${config.subAlerts ? "translate-x-5.5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Start Match */}
      <button
        onClick={onStartMatch}
        disabled={!canStart}
        className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-accent py-4 text-base font-bold text-bg-primary shadow-lg shadow-accent/25 transition hover:bg-accent-dim active:scale-[0.98] disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
      >
        {t("setup.startMatch")}
      </button>
      {!canStart && (
        <p className="text-center text-xs text-warning">
          {t("setup.needPlayers", { size: fieldSize, count: playerCount })}
        </p>
      )}
    </div>
  );
}
