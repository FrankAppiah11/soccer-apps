"use client";

import { useState, useCallback } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { LanguageProvider, useLanguage } from "@/lib/LanguageContext";
import { AuthProvider } from "@/lib/AuthContext";
import { usePersistence } from "@/lib/usePersistence";
import GameSetup from "@/components/GameSetup";
import PlayerRoster from "@/components/PlayerRoster";
import LiveDashboard from "@/components/LiveDashboard";
import StatsView from "@/components/StatsView";
import BottomNav, { TabId } from "@/components/BottomNav";
import { Player, GameConfig, MatchState, FIELD_SIZES } from "@/lib/types";
import { initializeMatch } from "@/lib/engine";

function AppContent() {
  const { t } = useLanguage();

  const [config, setConfig] = useState<GameConfig>({
    competitionType: "6v6",
    gameLengthMinutes: 20,
    equalPlaytime: true,
    subAlerts: false,
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("setup");

  const { loaded, saveConfig, savePlayers, saveMatch } = usePersistence(
    config,
    setConfig,
    players,
    setPlayers
  );

  const isMatchLive = matchState !== null && matchState.isRunning;
  const fieldSize = FIELD_SIZES[config.competitionType];
  const namedActive = players.filter((p) => p.name.trim() && !p.isInjured);
  const canStart = namedActive.length >= fieldSize;

  const handleConfigChange = useCallback(
    (c: GameConfig) => {
      setConfig(c);
      saveConfig(c);
    },
    [saveConfig]
  );

  const handlePlayersChange = useCallback(
    (p: Player[]) => {
      setPlayers(p);
      savePlayers(p);
    },
    [savePlayers]
  );

  const handleStartMatch = useCallback(() => {
    const validPlayers = players.filter((p) => p.name.trim());
    const state = initializeMatch(validPlayers, config);
    setMatchState(state);
    setActiveTab("game");
  }, [players, config]);

  const handleEndMatch = useCallback(() => {
    if (matchState) {
      const endedState = { ...matchState, isRunning: false, isPaused: true };
      setMatchState(endedState);

      const events = matchState.substitutionLog.map((sub) => {
        const outP = players.find((p) => p.id === sub.playerOutId);
        const inP = players.find((p) => p.id === sub.playerInId);
        return {
          eventType: "substitution",
          minute: sub.minute,
          second: sub.second,
          playerOutId: sub.playerOutId,
          playerInId: sub.playerInId,
          playerOutName: outP?.name ?? "Unknown",
          playerInName: inP?.name ?? "Unknown",
        };
      });

      saveMatch({
        competitionType: config.competitionType,
        gameLengthMinutes: config.gameLengthMinutes,
        playerCount: players.filter((p) => p.name.trim()).length,
        totalSubs: matchState.substitutionLog.length,
        endedAt: new Date().toISOString(),
        events,
      });
    }
    setActiveTab("stats");
  }, [matchState, players, config, saveMatch]);

  const handleMatchStateChange = useCallback((state: MatchState) => {
    setMatchState(state);
  }, []);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, []);

  if (!loaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-text-secondary">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg-primary">
      <header className="mx-auto flex w-full max-w-lg items-center justify-between px-4 pt-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚽</span>
          <span className="text-sm font-bold text-text-primary tracking-wide">
            SubManager
          </span>
        </div>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-3 pb-4 sm:px-5">
        {activeTab === "setup" && (
          <GameSetup
            config={config}
            onChange={handleConfigChange}
            onStartMatch={handleStartMatch}
            canStart={canStart}
            playerCount={namedActive.length}
          />
        )}

        {activeTab === "roster" && (
          <PlayerRoster
            players={players}
            config={config}
            onChange={handlePlayersChange}
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
              {t("noMatch.title")}
            </p>
            <p className="text-sm text-text-secondary mb-6">
              {t("noMatch.description")}
            </p>
            <button
              onClick={() => setActiveTab("setup")}
              className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-bg-primary"
            >
              {t("noMatch.goToSetup")}
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

      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isMatchLive={isMatchLive}
      />
    </div>
  );
}

function AuthBridge({ children }: { children: React.ReactNode }) {
  const { isSignedIn, user } = useUser();

  return (
    <AuthProvider isSignedIn={isSignedIn ?? false} userId={user?.id ?? null}>
      {children}
    </AuthProvider>
  );
}

export default function Home() {
  return (
    <AuthBridge>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthBridge>
  );
}
