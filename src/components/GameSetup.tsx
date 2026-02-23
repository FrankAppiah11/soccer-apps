"use client";

import { CompetitionType, GameConfig } from "@/lib/types";

interface GameSetupProps {
  config: GameConfig;
  onChange: (config: GameConfig) => void;
}

const COMPETITION_OPTIONS: { value: CompetitionType; label: string }[] = [
  { value: "3v3", label: "3 v 3" },
  { value: "6v6", label: "6 v 6" },
  { value: "11v11", label: "11 v 11" },
];

export default function GameSetup({ config, onChange }: GameSetupProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Game Setup</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Competition Type
          </label>
          <div className="flex gap-2">
            {COMPETITION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  onChange({ ...config, competitionType: opt.value })
                }
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  config.competitionType === opt.value
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="gameLength"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Game Length (minutes)
          </label>
          <input
            id="gameLength"
            type="number"
            min={5}
            max={120}
            value={config.gameLengthMinutes}
            onChange={(e) =>
              onChange({
                ...config,
                gameLengthMinutes: Math.max(5, parseInt(e.target.value) || 5),
              })
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
