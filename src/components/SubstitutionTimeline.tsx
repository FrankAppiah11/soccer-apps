"use client";

import { SubstitutionPlan, GameConfig } from "@/lib/types";

interface SubstitutionTimelineProps {
  plan: SubstitutionPlan | null;
  config: GameConfig;
}

export default function SubstitutionTimeline({
  plan,
  config,
}: SubstitutionTimelineProps) {
  if (!plan || plan.schedule.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Substitution Plan
        </h2>
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <div className="mb-2 text-4xl">&#128203;</div>
          <p className="text-sm text-gray-500">
            Add enough players and click &ldquo;Generate Plan&rdquo; to see the schedule.
          </p>
        </div>
      </div>
    );
  }

  const gameLength = config.gameLengthMinutes;
  const maxMinutes = Math.max(...plan.schedule.map((s) => s.totalMinutes));
  const minMinutes = Math.min(...plan.schedule.map((s) => s.totalMinutes));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-gray-900">
        Substitution Plan
      </h2>
      <p className="mb-5 text-sm text-gray-500">
        Playing time distribution across {gameLength} minutes
      </p>

      {/* Timeline visualization */}
      <div className="mb-6 space-y-3">
        {plan.schedule.map((entry) => {
          const isGK = entry.player.isGK;
          return (
            <div key={entry.player.id} className="flex items-center gap-3">
              <div className="w-24 shrink-0 text-right">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {entry.player.name}
                </p>
                <p className="text-xs text-gray-400">{entry.player.position}</p>
              </div>

              <div className="relative h-7 flex-1 rounded-lg bg-gray-100">
                {entry.intervals.map((interval, i) => {
                  const left = (interval.start / gameLength) * 100;
                  const width =
                    ((interval.end - interval.start) / gameLength) * 100;
                  return (
                    <div
                      key={i}
                      className={`absolute top-0 h-full rounded-lg ${
                        isGK
                          ? "bg-amber-400"
                          : "bg-emerald-500"
                      }`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`${interval.start}' - ${interval.end}'`}
                    />
                  );
                })}
              </div>

              <div className="w-16 shrink-0 text-right">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    entry.totalMinutes === maxMinutes && maxMinutes !== minMinutes
                      ? "bg-emerald-100 text-emerald-700"
                      : entry.totalMinutes === minMinutes && maxMinutes !== minMinutes
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {Math.round(entry.totalMinutes)}&#8242;
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Minute markers */}
      <div className="ml-[calc(6rem+0.75rem)] mr-[calc(4rem+0.75rem)] flex justify-between text-xs text-gray-400">
        <span>0&#8242;</span>
        <span>{Math.round(gameLength / 4)}&#8242;</span>
        <span>{Math.round(gameLength / 2)}&#8242;</span>
        <span>{Math.round((gameLength * 3) / 4)}&#8242;</span>
        <span>{gameLength}&#8242;</span>
      </div>

      {/* Substitution events */}
      {plan.substitutions.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            Substitution Events
          </h3>
          <div className="space-y-2">
            {plan.substitutions.map((sub, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-2.5"
              >
                <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-bold text-gray-600">
                  {sub.minute}&#8242;
                </span>
                <span className="text-sm text-red-500 font-medium">
                  &#9660; {sub.playerOut.name}
                </span>
                <span className="text-xs text-gray-400">&#8594;</span>
                <span className="text-sm text-emerald-600 font-medium">
                  &#9650; {sub.playerIn.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Starting lineup & Bench */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-700">
            Starting Lineup
          </h3>
          <div className="space-y-1">
            {plan.startingLineup.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    p.isGK ? "bg-amber-400" : "bg-emerald-500"
                  }`}
                />
                {p.name}{" "}
                <span className="text-xs text-gray-400">({p.position})</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Bench</h3>
          {plan.bench.length === 0 ? (
            <p className="text-sm text-gray-400">No bench players</p>
          ) : (
            <div className="space-y-1">
              {plan.bench.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      p.isInjured ? "bg-red-400" : "bg-gray-300"
                    }`}
                  />
                  {p.name}{" "}
                  <span className="text-xs text-gray-400">
                    ({p.position})
                    {p.isInjured && (
                      <span className="ml-1 text-red-500">injured</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
