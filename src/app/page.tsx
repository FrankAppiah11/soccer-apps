"use client";

import { useState, useCallback } from "react";
import GameSetup from "@/components/GameSetup";
import PlayerRoster from "@/components/PlayerRoster";
import LiveDashboard from "@/components/LiveDashboard";
import StatsView from "@/components/StatsView";
import BottomNav, { TabId } from "@/components/BottomNav";
import { Player, GameConfig, MatchState, FIELD_SIZES } from "@/lib/types";
import { initializeMatch } from "@/lib/engine";

export default function Home() {
  const [config, setConfig] = useState<GameConfig>({
    competitionType: "6v6",
    gameLengthMinutes: 20,
    equalPlaytime: true,
    subAlerts: false,
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("setup");

  const isMatchLive = matchState !== null && matchState.isRunning;
  const fieldSize = FIELD_SIZES[config.competitionType];
  const namedActive = players.filter((p) => p.name.trim() && !p.isInjured);
  const canStart = namedActive.length >= fieldSize;

  const handleStartMatch = useCallback(() => {
    const validPlayers = players.filter((p) => p.name.trim());
    const state = initializeMatch(validPlayers, config);
    setMatchState(state);
    setActiveTab("game");
  }, [players, config]);

  const handleEndMatch = useCallback(() => {
    if (matchState) {
      setMatchState({ ...matchState, isRunning: false, isPaused: true });
    }
    setActiveTab("stats");
  }, [matchState]);

  const handleMatchStateChange = useCallback((state: MatchState) => {
    setMatchState(state);
  }, []);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-bg-primary">
      {/* Main Content */}
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pt-6 pb-4">
        {activeTab === "setup" && (
          <GameSetup
            config={config}
            onChange={setConfig}
            onStartMatch={handleStartMatch}
            canStart={canStart}
            playerCount={namedActive.length}
          />
        )}

        {activeTab === "roster" && (
          <PlayerRoster
            players={players}
            config={config}
            onChange={setPlayers}
          />
        )}

        {activeTab === "game" && matchState && (
          <LiveDashboard
            players={players}
            config={config}
            matchState={matchState}
            onMatchStateChange={handleMatchStateChange}
            onEndMatch={handleEndMatch}
          />
        )}

        {activeTab === "game" && !matchState && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-slide-up">
            <p className="text-5xl mb-4">⚽</p>
            <p className="text-lg font-semibold text-text-primary mb-2">
              No Active Match
            </p>
            <p className="text-sm text-text-secondary mb-6">
              Set up your game and add players first, then start the match.
            </p>
            <button
              onClick={() => setActiveTab("setup")}
              className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-bg-primary"
            >
              Go to Setup
            </button>
          </div>
        )}

        {activeTab === "stats" && (
          <StatsView
            players={players}
            matchState={matchState}
            config={config}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isMatchLive={isMatchLive}
      />
    </div>
  );
}
