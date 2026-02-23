export type CompetitionType = "11v11" | "6v6" | "5v5" | "3v3";

export type Position =
  | "GK"
  | "CB"
  | "LB"
  | "RB"
  | "CDM"
  | "CM"
  | "CAM"
  | "LM"
  | "RM"
  | "LW"
  | "RW"
  | "ST"
  | "CF";

export type PositionGroup = "FW" | "MID" | "DEF" | "GK";

export interface Player {
  id: string;
  name: string;
  position: Position;
  positionGroup: PositionGroup;
  desiredMinutes: number | null;
  isInjured: boolean;
  isGK: boolean;
}

export interface GameConfig {
  competitionType: CompetitionType;
  gameLengthMinutes: number;
  equalPlaytime: boolean;
  subAlerts: boolean;
}

export interface SubstitutionEvent {
  id: string;
  minute: number;
  second: number;
  playerOutId: string;
  playerInId: string;
  timestamp: number;
}

export interface LivePlayerState {
  playerId: string;
  isOnField: boolean;
  totalSecondsPlayed: number;
  currentStintStart: number | null;
  rotationIntervalSeconds: number;
}

export interface MatchState {
  isRunning: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  half: 1 | 2;
  onFieldIds: string[];
  benchIds: string[];
  playerStates: Record<string, LivePlayerState>;
  substitutionLog: SubstitutionEvent[];
}

export const FIELD_SIZES: Record<CompetitionType, number> = {
  "11v11": 11,
  "6v6": 6,
  "5v5": 5,
  "3v3": 3,
};

export const COMPETITION_META: Record<
  CompetitionType,
  { label: string; subtitle: string }
> = {
  "3v3": { label: "3v3", subtitle: "Small Sided" },
  "5v5": { label: "5v5", subtitle: "Indoor" },
  "6v6": { label: "6v6", subtitle: "Pickup" },
  "11v11": { label: "11v11", subtitle: "Full Field" },
};

export const POSITIONS_BY_TYPE: Record<CompetitionType, Position[]> = {
  "11v11": ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST", "CF"],
  "6v6": ["GK", "CB", "CM", "LM", "RM", "ST", "CF", "LW", "RW"],
  "5v5": ["GK", "CB", "CM", "ST", "CF", "LW", "RW"],
  "3v3": ["GK", "CM", "ST", "CF", "LW", "RW"],
};

export function getPositionGroup(pos: Position): PositionGroup {
  if (pos === "GK") return "GK";
  if (["CB", "LB", "RB"].includes(pos)) return "DEF";
  if (["CDM", "CM", "CAM", "LM", "RM"].includes(pos)) return "MID";
  return "FW";
}

export const POSITION_GROUP_COLORS: Record<PositionGroup, string> = {
  GK: "#f5a623",
  DEF: "#4a90d9",
  MID: "#3cff5a",
  FW: "#ff6b35",
};
