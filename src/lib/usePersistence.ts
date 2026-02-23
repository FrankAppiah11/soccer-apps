"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAppAuth } from "./AuthContext";
import type { Player, GameConfig, Position, PositionGroup } from "./types";

export function usePersistence(
  config: GameConfig,
  setConfig: (c: GameConfig) => void,
  players: Player[],
  setPlayers: (p: Player[]) => void
) {
  const { isSignedIn } = useAppAuth();
  const [loaded, setLoaded] = useState(false);
  const saveTimerConfig = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimerPlayers = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoad = useRef(true);

  useEffect(() => {
    if (!isSignedIn) {
      setLoaded(true);
      return;
    }

    async function load() {
      try {
        const [configRes, playersRes] = await Promise.all([
          fetch("/api/config"),
          fetch("/api/players"),
        ]);

        if (configRes.ok) {
          const { config: saved } = await configRes.json();
          if (saved) {
            setConfig({
              competitionType: saved.competition_type,
              gameLengthMinutes: saved.game_length_minutes,
              equalPlaytime: saved.equal_playtime,
              subAlerts: saved.sub_alerts,
            });
          }
        }

        if (playersRes.ok) {
          const { players: savedPlayers } = await playersRes.json();
          if (savedPlayers && savedPlayers.length > 0) {
            const mapped: Player[] = savedPlayers.map(
              (p: {
                id: string;
                name: string;
                position: string;
                position_group: string;
                desired_minutes: number | null;
                is_injured: boolean;
                is_gk: boolean;
              }) => ({
                id: p.id,
                name: p.name,
                position: p.position as Position,
                positionGroup: p.position_group as PositionGroup,
                desiredMinutes: p.desired_minutes,
                isInjured: p.is_injured,
                isGK: p.is_gk,
              })
            );
            setPlayers(mapped);
          }
        }
      } catch {
        // Silently fail — user can still use the app offline
      } finally {
        setLoaded(true);
        initialLoad.current = false;
      }
    }

    load();
  }, [isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveConfig = useCallback(
    (c: GameConfig) => {
      if (!isSignedIn || initialLoad.current) return;
      if (saveTimerConfig.current) clearTimeout(saveTimerConfig.current);
      saveTimerConfig.current = setTimeout(async () => {
        try {
          await fetch("/api/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              competitionType: c.competitionType,
              gameLengthMinutes: c.gameLengthMinutes,
              equalPlaytime: c.equalPlaytime,
              subAlerts: c.subAlerts,
            }),
          });
        } catch {
          // silent
        }
      }, 1000);
    },
    [isSignedIn]
  );

  const savePlayers = useCallback(
    (p: Player[]) => {
      if (!isSignedIn || initialLoad.current) return;
      if (saveTimerPlayers.current) clearTimeout(saveTimerPlayers.current);
      saveTimerPlayers.current = setTimeout(async () => {
        try {
          await fetch("/api/players", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ players: p }),
          });
        } catch {
          // silent
        }
      }, 1000);
    },
    [isSignedIn]
  );

  const saveMatch = useCallback(
    async (matchData: {
      competitionType: string;
      gameLengthMinutes: number;
      playerCount: number;
      totalSubs: number;
      endedAt: string;
      events: Array<{
        eventType: string;
        minute: number;
        second: number;
        playerOutId?: string;
        playerInId?: string;
        playerOutName?: string;
        playerInName?: string;
      }>;
    }) => {
      if (!isSignedIn) return;
      try {
        await fetch("/api/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(matchData),
        });
      } catch {
        // silent
      }
    },
    [isSignedIn]
  );

  return { loaded, saveConfig, savePlayers, saveMatch };
}
