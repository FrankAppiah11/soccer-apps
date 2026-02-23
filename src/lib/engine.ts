import {
  Player,
  GameConfig,
  LivePlayerState,
  MatchState,
  SubstitutionEvent,
  FIELD_SIZES,
} from "./types";
import { v4 as uuidv4 } from "uuid";

export function initializeMatch(
  players: Player[],
  config: GameConfig
): MatchState {
  const fieldSize = FIELD_SIZES[config.competitionType];
  const activePlayers = players.filter((p) => !p.isInjured && p.name.trim());
  const gk = activePlayers.find((p) => p.isGK);
  const outfield = activePlayers.filter((p) => !p.isGK);
  const outfieldSlots = gk ? fieldSize - 1 : fieldSize;

  const totalActive = activePlayers.length;
  const gameLengthSec = config.gameLengthMinutes * 60;
  const rotationInterval = totalActive > fieldSize
    ? Math.floor(gameLengthSec / Math.ceil(totalActive / fieldSize))
    : gameLengthSec;

  const startingOutfield = outfield.slice(0, outfieldSlots);
  const benchOutfield = outfield.slice(outfieldSlots);

  const onFieldIds = [
    ...(gk ? [gk.id] : []),
    ...startingOutfield.map((p) => p.id),
  ];
  const benchIds = [
    ...benchOutfield.map((p) => p.id),
    ...players.filter((p) => p.isInjured).map((p) => p.id),
  ];

  const playerStates: Record<string, LivePlayerState> = {};
  for (const p of activePlayers) {
    playerStates[p.id] = {
      playerId: p.id,
      isOnField: onFieldIds.includes(p.id),
      totalSecondsPlayed: 0,
      currentStintStart: onFieldIds.includes(p.id) ? 0 : null,
      rotationIntervalSeconds: rotationInterval,
    };
  }

  return {
    isRunning: false,
    isPaused: false,
    elapsedSeconds: 0,
    half: 1,
    onFieldIds,
    benchIds: benchIds.filter((id) => playerStates[id]),
    playerStates,
    substitutionLog: [],
  };
}

export function performSubstitution(
  state: MatchState,
  playerOutId: string,
  playerInId: string
): MatchState {
  const elapsed = state.elapsedSeconds;
  const outState = state.playerStates[playerOutId];
  const inState = state.playerStates[playerInId];
  if (!outState || !inState) return state;

  const updatedOutState: LivePlayerState = {
    ...outState,
    isOnField: false,
    totalSecondsPlayed:
      outState.totalSecondsPlayed +
      (outState.currentStintStart !== null
        ? elapsed - outState.currentStintStart
        : 0),
    currentStintStart: null,
  };

  const updatedInState: LivePlayerState = {
    ...inState,
    isOnField: true,
    currentStintStart: elapsed,
  };

  const subEvent: SubstitutionEvent = {
    id: uuidv4(),
    minute: Math.floor(elapsed / 60),
    second: elapsed % 60,
    playerOutId,
    playerInId,
    timestamp: elapsed,
  };

  return {
    ...state,
    onFieldIds: state.onFieldIds
      .filter((id) => id !== playerOutId)
      .concat(playerInId),
    benchIds: state.benchIds
      .filter((id) => id !== playerInId)
      .concat(playerOutId),
    playerStates: {
      ...state.playerStates,
      [playerOutId]: updatedOutState,
      [playerInId]: updatedInState,
    },
    substitutionLog: [...state.substitutionLog, subEvent],
  };
}

export function undoLastSubstitution(state: MatchState): MatchState {
  const log = state.substitutionLog;
  if (log.length === 0) return state;

  const lastSub = log[log.length - 1];
  const elapsed = state.elapsedSeconds;

  const outState = state.playerStates[lastSub.playerOutId];
  const inState = state.playerStates[lastSub.playerInId];
  if (!outState || !inState) return state;

  const restoredOutState: LivePlayerState = {
    ...outState,
    isOnField: true,
    currentStintStart: elapsed,
  };

  const restoredInState: LivePlayerState = {
    ...inState,
    isOnField: false,
    totalSecondsPlayed:
      inState.totalSecondsPlayed +
      (inState.currentStintStart !== null
        ? elapsed - inState.currentStintStart
        : 0),
    currentStintStart: null,
  };

  return {
    ...state,
    onFieldIds: state.onFieldIds
      .filter((id) => id !== lastSub.playerInId)
      .concat(lastSub.playerOutId),
    benchIds: state.benchIds
      .filter((id) => id !== lastSub.playerOutId)
      .concat(lastSub.playerInId),
    playerStates: {
      ...state.playerStates,
      [lastSub.playerOutId]: restoredOutState,
      [lastSub.playerInId]: restoredInState,
    },
    substitutionLog: log.slice(0, -1),
  };
}

export function getPlayerPlayedSeconds(
  pState: LivePlayerState,
  elapsedSeconds: number
): number {
  let total = pState.totalSecondsPlayed;
  if (pState.isOnField && pState.currentStintStart !== null) {
    total += elapsedSeconds - pState.currentStintStart;
  }
  return total;
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function getNextSubSuggestion(
  state: MatchState,
  players: Player[]
): { outId: string; inId: string } | null {
  const benchActive = state.benchIds.filter((id) => {
    const p = players.find((pl) => pl.id === id);
    return p && !p.isInjured && !p.isGK;
  });
  if (benchActive.length === 0) return null;

  const onFieldOutfield = state.onFieldIds.filter((id) => {
    const p = players.find((pl) => pl.id === id);
    return p && !p.isGK;
  });
  if (onFieldOutfield.length === 0) return null;

  let maxPlayed = -1;
  let outId = onFieldOutfield[0];
  for (const id of onFieldOutfield) {
    const played = getPlayerPlayedSeconds(
      state.playerStates[id],
      state.elapsedSeconds
    );
    if (played > maxPlayed) {
      maxPlayed = played;
      outId = id;
    }
  }

  let minPlayed = Infinity;
  let inId = benchActive[0];
  for (const id of benchActive) {
    const played = getPlayerPlayedSeconds(
      state.playerStates[id],
      state.elapsedSeconds
    );
    if (played < minPlayed) {
      minPlayed = played;
      inId = id;
    }
  }

  return { outId, inId };
}
