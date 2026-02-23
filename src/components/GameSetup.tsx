"use client";

import {
  CompetitionType,
  GameConfig,
  COMPETITION_META,
  FIELD_SIZES,
} from "@/lib/types";

interface GameSetupProps {
  config: GameConfig;
  onChange: (config: GameConfig) => void;
  onStartMatch: () => void;
  canStart: boolean;
  playerCount: number;
}

const COMPETITION_ORDER: CompetitionType[] = ["3v3", "5v5", "6v6", "11v11"];

export default function GameSetup({
  config,
  onChange,
  onStartMatch,
  canStart,
  playerCount,
}: GameSetupProps) {
  const meta = COMPETITION_META[config.competitionType];
  const fieldSize = FIELD_SIZES[config.competitionType];

  return (
    <div className="flex flex-col gap-5 pb-28 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h1 className="text-xl font-bold text-text-primary">Game Setup</h1>
        <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border-color text-text-secondary hover:text-accent transition">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Selected format banner */}
      <div className="rounded-2xl bg-gradient-to-r from-accent/20 to-accent/5 border border-accent/30 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">
          Selected Format
        </p>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              {meta.label} Match
            </h2>
            <p className="text-sm text-text-secondary">
              {config.gameLengthMinutes} Minutes Total
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
            Competition Type
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {COMPETITION_ORDER.map((type) => {
            const m = COMPETITION_META[type];
            const isSelected = config.competitionType === type;
            const isDefault = type === "6v6";
            return (
              <button
                key={type}
                onClick={() =>
                  onChange({ ...config, competitionType: type })
                }
                className={`relative rounded-xl border-2 p-3 sm:p-4 text-left transition-all active:scale-[0.98] ${
                  isSelected
                    ? "border-accent bg-accent/10"
                    : "border-border-color bg-bg-card hover:border-border-color/80 hover:bg-bg-card-hover"
                }`}
              >
                {isDefault && (
                  <span className="absolute -top-2.5 left-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-bg-primary">
                    Default
                  </span>
                )}
                <p className="text-xs text-text-secondary">{m.subtitle}</p>
                <p className="text-lg font-bold text-text-primary">{m.label}</p>
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
              Match Duration
            </h3>
          </div>
          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
            {config.gameLengthMinutes} min
          </span>
        </div>
        <div className="rounded-2xl border border-border-color bg-bg-card p-4 sm:p-5">
          <div className="flex items-center justify-center gap-5 sm:gap-6 mb-4">
            <button
              onClick={() =>
                onChange({
                  ...config,
                  gameLengthMinutes: Math.max(5, config.gameLengthMinutes - 5),
                })
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
                Minutes
              </p>
            </div>
            <button
              onClick={() =>
                onChange({
                  ...config,
                  gameLengthMinutes: Math.min(120, config.gameLengthMinutes + 5),
                })
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
            onChange={(e) =>
              onChange({
                ...config,
                gameLengthMinutes: parseInt(e.target.value),
              })
            }
            className="w-full"
          />
        </div>
      </div>

      {/* Quick Rules */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-base font-semibold text-text-primary">
            Quick Rules
          </h3>
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
                <p className="text-sm font-medium text-text-primary">Equal Playtime</p>
                <p className="text-xs text-text-muted truncate">Auto-calculate sub intervals</p>
              </div>
            </div>
            <button
              onClick={() =>
                onChange({ ...config, equalPlaytime: !config.equalPlaytime })
              }
              className={`relative h-7 w-12 shrink-0 ml-3 rounded-full transition-colors ${
                config.equalPlaytime ? "bg-accent" : "bg-bg-elevated"
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  config.equalPlaytime ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
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
                <p className="text-sm font-medium text-text-primary">Sub Alerts</p>
                <p className="text-xs text-text-muted truncate">Vibrate when it&apos;s time to swap</p>
              </div>
            </div>
            <button
              onClick={() =>
                onChange({ ...config, subAlerts: !config.subAlerts })
              }
              className={`relative h-7 w-12 shrink-0 ml-3 rounded-full transition-colors ${
                config.subAlerts ? "bg-accent" : "bg-bg-elevated"
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  config.subAlerts ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
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
        START MATCH ▶
      </button>
      {!canStart && (
        <p className="text-center text-xs text-warning">
          Need at least {fieldSize} named players ({playerCount} added)
        </p>
      )}
    </div>
  );
}
