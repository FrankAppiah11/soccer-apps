export type CompetitionType = "11v11" | "6v6" | "3v3";

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

export interface Player {
  id: string;
  name: string;
  position: Position;
  desiredMinutes: number | null; // null = equal share
  isInjured: boolean;
  isGK: boolean;
}

export interface GameConfig {
  competitionType: CompetitionType;
  gameLengthMinutes: number;
}

export interface SubstitutionEvent {
  minute: number;
  playerOut: Player;
  playerIn: Player;
}

export interface PlayerScheduleEntry {
  player: Player;
  intervals: { start: number; end: number }[];
  totalMinutes: number;
}

export interface SubstitutionPlan {
  schedule: PlayerScheduleEntry[];
  substitutions: SubstitutionEvent[];
  startingLineup: Player[];
  bench: Player[];
}

export const FIELD_SIZES: Record<CompetitionType, number> = {
  "11v11": 11,
  "6v6": 6,
  "3v3": 3,
};

export const POSITIONS_BY_TYPE: Record<CompetitionType, Position[]> = {
  "11v11": ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST", "CF"],
  "6v6": ["GK", "CB", "CM", "LM", "RM", "ST", "CF", "LW", "RW"],
  "3v3": ["GK", "CM", "ST", "CF", "LW", "RW"],
};
