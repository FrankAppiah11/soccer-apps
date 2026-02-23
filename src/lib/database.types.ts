export interface Database {
  public: {
    Tables: {
      game_configs: {
        Row: {
          id: string;
          user_id: string;
          competition_type: string;
          game_length_minutes: number;
          equal_playtime: boolean;
          sub_alerts: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          competition_type: string;
          game_length_minutes: number;
          equal_playtime?: boolean;
          sub_alerts?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          competition_type?: string;
          game_length_minutes?: number;
          equal_playtime?: boolean;
          sub_alerts?: boolean;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          position: string;
          position_group: string;
          desired_minutes: number | null;
          is_injured: boolean;
          is_gk: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          position: string;
          position_group: string;
          desired_minutes?: number | null;
          is_injured?: boolean;
          is_gk?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          position?: string;
          position_group?: string;
          desired_minutes?: number | null;
          is_injured?: boolean;
          is_gk?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          user_id: string;
          competition_type: string;
          game_length_minutes: number;
          started_at: string;
          ended_at: string | null;
          total_subs: number;
          player_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          competition_type: string;
          game_length_minutes: number;
          started_at?: string;
          ended_at?: string | null;
          total_subs?: number;
          player_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          competition_type?: string;
          game_length_minutes?: number;
          ended_at?: string | null;
          total_subs?: number;
          player_count?: number;
        };
      };
      match_events: {
        Row: {
          id: string;
          match_id: string;
          event_type: string;
          minute: number;
          second: number;
          player_out_id: string | null;
          player_in_id: string | null;
          player_out_name: string | null;
          player_in_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          event_type: string;
          minute: number;
          second: number;
          player_out_id?: string | null;
          player_in_id?: string | null;
          player_out_name?: string | null;
          player_in_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          event_type?: string;
          minute?: number;
          second?: number;
          player_out_id?: string | null;
          player_in_id?: string | null;
          player_out_name?: string | null;
          player_in_name?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
