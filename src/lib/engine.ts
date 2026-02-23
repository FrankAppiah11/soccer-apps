import {
  Player,
  GameConfig,
  SubstitutionPlan,
  SubstitutionEvent,
  PlayerScheduleEntry,
  FIELD_SIZES,
} from "./types";

/**
 * Generates a fair substitution plan that balances playing time across all players.
 *
 * Strategy: divide the game into equal-length windows. In each window, pick the
 * players with the fewest accumulated minutes so far (respecting GK lock rules).
 * GKs stay on the whole game unless injured.
 */
export function generateSubstitutionPlan(
  players: Player[],
  config: GameConfig
): SubstitutionPlan {
  const fieldSize = FIELD_SIZES[config.competitionType];
  const gameLength = config.gameLengthMinutes;

  const activePlayers = players.filter((p) => !p.isInjured);
  const injuredPlayers = players.filter((p) => p.isInjured);

  const goalkeepers = activePlayers.filter((p) => p.isGK);
  const outfieldPlayers = activePlayers.filter((p) => !p.isGK);

  const gk = goalkeepers[0] ?? null;
  const outfieldSlots = gk ? fieldSize - 1 : fieldSize;

  if (outfieldPlayers.length === 0) {
    return { schedule: [], substitutions: [], startingLineup: [], bench: [] };
  }

  if (outfieldPlayers.length <= outfieldSlots) {
    const starting = gk ? [gk, ...outfieldPlayers] : [...outfieldPlayers];
    const schedule: PlayerScheduleEntry[] = starting.map((p) => ({
      player: p,
      intervals: [{ start: 0, end: gameLength }],
      totalMinutes: gameLength,
    }));
    return { schedule, substitutions: [], startingLineup: starting, bench: [] };
  }

  const numWindows = Math.max(
    2,
    Math.min(
      Math.ceil(outfieldPlayers.length / outfieldSlots) + 1,
      Math.floor(gameLength / 2)
    )
  );
  const windowLength = gameLength / numWindows;

  const minutesPlayed: Map<string, number> = new Map();
  const intervals: Map<string, { start: number; end: number }[]> = new Map();

  for (const p of outfieldPlayers) {
    minutesPlayed.set(p.id, 0);
    intervals.set(p.id, []);
  }

  if (gk) {
    minutesPlayed.set(gk.id, 0);
    intervals.set(gk.id, []);
  }

  const substitutions: SubstitutionEvent[] = [];
  let currentOnField: Set<string> = new Set();

  for (let w = 0; w < numWindows; w++) {
    const windowStart = Math.round(w * windowLength);
    const windowEnd = Math.round((w + 1) * windowLength);
    const windowDuration = windowEnd - windowStart;

    const sorted = [...outfieldPlayers].sort((a, b) => {
      const aMin = minutesPlayed.get(a.id)!;
      const bMin = minutesPlayed.get(b.id)!;
      if (aMin !== bMin) return aMin - bMin;
      const aDesired = a.desiredMinutes ?? gameLength;
      const bDesired = b.desiredMinutes ?? gameLength;
      return bDesired - aDesired;
    });

    const selectedIds = new Set(sorted.slice(0, outfieldSlots).map((p) => p.id));

    if (w > 0) {
      const prevOnField = new Set(currentOnField);
      const goingOff = [...prevOnField].filter((id) => !selectedIds.has(id));
      const comingOn = [...selectedIds].filter((id) => !prevOnField.has(id));

      for (let i = 0; i < Math.min(goingOff.length, comingOn.length); i++) {
        const outPlayer = outfieldPlayers.find((p) => p.id === goingOff[i])!;
        const inPlayer = outfieldPlayers.find((p) => p.id === comingOn[i])!;
        substitutions.push({
          minute: windowStart,
          playerOut: outPlayer,
          playerIn: inPlayer,
        });
      }
    }

    currentOnField = selectedIds;

    for (const id of selectedIds) {
      minutesPlayed.set(id, (minutesPlayed.get(id) ?? 0) + windowDuration);
      const playerIntervals = intervals.get(id)!;
      const last = playerIntervals[playerIntervals.length - 1];
      if (last && last.end === windowStart) {
        last.end = windowEnd;
      } else {
        playerIntervals.push({ start: windowStart, end: windowEnd });
      }
    }

    if (gk) {
      minutesPlayed.set(gk.id, (minutesPlayed.get(gk.id) ?? 0) + windowDuration);
      const gkIntervals = intervals.get(gk.id)!;
      const last = gkIntervals[gkIntervals.length - 1];
      if (last && last.end === windowStart) {
        last.end = windowEnd;
      } else {
        gkIntervals.push({ start: windowStart, end: windowEnd });
      }
    }
  }

  const allActive = gk ? [gk, ...outfieldPlayers] : outfieldPlayers;
  const schedule: PlayerScheduleEntry[] = allActive.map((p) => ({
    player: p,
    intervals: intervals.get(p.id) ?? [],
    totalMinutes: minutesPlayed.get(p.id) ?? 0,
  }));

  const startingLineup = allActive.filter((p) =>
    schedule.find((s) => s.player.id === p.id)?.intervals.some((i) => i.start === 0)
  );
  const bench = [
    ...allActive.filter((p) => !startingLineup.includes(p)),
    ...injuredPlayers,
  ];

  return { schedule, substitutions, startingLineup, bench };
}
