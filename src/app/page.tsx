"use client";

import { useState, useCallback } from "react";
import GameSetup from "@/components/GameSetup";
import PlayerRoster from "@/components/PlayerRoster";
import SubstitutionTimeline from "@/components/SubstitutionTimeline";
import { Player, GameConfig, SubstitutionPlan, FIELD_SIZES } from "@/lib/types";
import { generateSubstitutionPlan } from "@/lib/engine";

export default function Home() {
  const [config, setConfig] = useState<GameConfig>({
    competitionType: "6v6",
    gameLengthMinutes: 20,
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [plan, setPlan] = useState<SubstitutionPlan | null>(null);

  const fieldSize = FIELD_SIZES[config.competitionType];
  const activePlayers = players.filter((p) => !p.isInjured);
  const namedPlayers = activePlayers.filter((p) => p.name.trim());
  const canGenerate = namedPlayers.length >= fieldSize;

  const handleGenerate = useCallback(() => {
    const valid = players.filter((p) => p.name.trim());
    const result = generateSubstitutionPlan(valid, config);
    setPlan(result);
  }, [players, config]);

  const handleConfigChange = useCallback((newConfig: GameConfig) => {
    setConfig(newConfig);
    setPlan(null);
  }, []);

  const handlePlayersChange = useCallback((newPlayers: Player[]) => {
    setPlayers(newPlayers);
    setPlan(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg text-white">
              &#9917;
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SubManager</h1>
              <p className="text-xs text-gray-500">
                Fair substitutions for pickup games
              </p>
            </div>
          </div>
          {plan && (
            <button
              onClick={() => setPlan(null)}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-200"
            >
              &#8592; Edit
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        {!plan ? (
          <>
            <GameSetup config={config} onChange={handleConfigChange} />
            <PlayerRoster
              players={players}
              competitionType={config.competitionType}
              gameLengthMinutes={config.gameLengthMinutes}
              onChange={handlePlayersChange}
            />

            {/* Generate button */}
            <div className="flex flex-col items-center gap-2">
              {!canGenerate && namedPlayers.length > 0 && (
                <p className="text-sm text-amber-600">
                  Need at least {fieldSize} active players for{" "}
                  {config.competitionType} (have {namedPlayers.length})
                </p>
              )}
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="rounded-xl bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 hover:shadow-emerald-700/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                Generate Substitution Plan
              </button>
              {canGenerate && (
                <p className="text-xs text-gray-500">
                  {namedPlayers.length} players &middot; {fieldSize} on field
                  &middot; {config.gameLengthMinutes} min game
                </p>
              )}
            </div>
          </>
        ) : (
          <SubstitutionTimeline plan={plan} config={config} />
        )}
      </main>

      <footer className="mt-auto border-t border-gray-200 bg-white/60 py-4 text-center text-xs text-gray-400">
        SubManager &mdash; Equal play time, every game.
      </footer>
    </div>
  );
}
