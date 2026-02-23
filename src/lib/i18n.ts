export type Lang = "en" | "es";

const translations = {
  // Navigation
  "nav.roster": { en: "Roster", es: "Plantilla" },
  "nav.roster.live": { en: "Squad", es: "Equipo" },
  "nav.game": { en: "Game", es: "Juego" },
  "nav.game.live": { en: "Live", es: "En Vivo" },
  "nav.stats": { en: "Stats", es: "Estad." },
  "nav.setup": { en: "Setup", es: "Config" },
  "nav.setup.live": { en: "Config", es: "Config" },

  // Game Setup
  "setup.title": { en: "Game Setup", es: "Configuración" },
  "setup.selectedFormat": { en: "Selected Format", es: "Formato Elegido" },
  "setup.match": { en: "Match", es: "Partido" },
  "setup.minutesTotal": { en: "Minutes Total", es: "Minutos Totales" },
  "setup.competitionType": { en: "Competition Type", es: "Tipo de Competencia" },
  "setup.default": { en: "Default", es: "Predeter." },
  "setup.matchDuration": { en: "Match Duration", es: "Duración del Partido" },
  "setup.min": { en: "min", es: "min" },
  "setup.minutes": { en: "Minutes", es: "Minutos" },
  "setup.quickRules": { en: "Quick Rules", es: "Reglas Rápidas" },
  "setup.equalPlaytime": { en: "Equal Playtime", es: "Tiempo Igual" },
  "setup.equalPlaytimeDesc": { en: "Auto-calculate sub intervals", es: "Calcular intervalos automáticamente" },
  "setup.subAlerts": { en: "Sub Alerts", es: "Alertas de Cambio" },
  "setup.subAlertsDesc": { en: "Vibrate when it's time to swap", es: "Vibrar cuando sea hora de cambiar" },
  "setup.startMatch": { en: "START MATCH ▶", es: "INICIAR PARTIDO ▶" },
  "setup.needPlayers": { en: "Need at least {size} named players ({count} added)", es: "Se necesitan al menos {size} jugadores ({count} añadidos)" },

  // Competition subtitles
  "comp.3v3": { en: "Small Sided", es: "Reducido" },
  "comp.5v5": { en: "Indoor", es: "Fútbol Sala" },
  "comp.6v6": { en: "Pickup", es: "Recreativo" },
  "comp.11v11": { en: "Full Field", es: "Campo Completo" },

  // Player Roster
  "roster.title": { en: "Roster", es: "Plantilla" },
  "roster.resetAll": { en: "Reset All", es: "Borrar Todo" },
  "roster.allPlayers": { en: "All Players", es: "Todos" },
  "roster.forward": { en: "Forward", es: "Delantero" },
  "roster.midfield": { en: "Midfield", es: "Mediocampo" },
  "roster.defense": { en: "Defense", es: "Defensa" },
  "roster.matchSquad": { en: "Match Squad", es: "Convocatoria" },
  "roster.avgPerPlayer": { en: "Avg {min}m / player", es: "Prom {min}m / jugador" },
  "roster.noPlayers": { en: "No players yet. Tap + to add players.", es: "Sin jugadores. Toca + para añadir." },
  "roster.playerName": { en: "Player name", es: "Nombre del jugador" },
  "roster.position": { en: "Position", es: "Posición" },
  "roster.targetMinutes": { en: "Target Minutes", es: "Minutos Objetivo" },
  "roster.auto": { en: "Auto", es: "Auto" },
  "roster.save": { en: "Save", es: "Guardar" },
  "roster.cancel": { en: "Cancel", es: "Cancelar" },
  "roster.unnamed": { en: "Unnamed", es: "Sin nombre" },
  "roster.primaryKeeper": { en: "★ Primary Keeper", es: "★ Portero Titular" },
  "roster.target": { en: "Target: {min} mins", es: "Objetivo: {min} min" },
  "roster.injured": { en: "🚑 Injured", es: "🚑 Lesionado" },
  "roster.gkActive": { en: "GK Active", es: "POR Activo" },
  "roster.gkStatus": { en: "GK Status", es: "Estado POR" },
  "roster.edit": { en: "Edit", es: "Editar" },
  "roster.injury": { en: "Injury", es: "Lesión" },
  "roster.markFit": { en: "Mark Fit", es: "Marcar Apto" },
  "roster.remove": { en: "Remove", es: "Eliminar" },

  // Live Dashboard
  "live.title": { en: "Match Dashboard", es: "Panel del Partido" },
  "live.endMatch": { en: "END MATCH", es: "TERMINAR" },
  "live.endConfirm": { en: "End the match? This will stop the clock.", es: "¿Terminar el partido? Esto detendrá el reloj." },
  "live.endConfirmYes": { en: "End Match", es: "Terminar Partido" },
  "live.liveClock": { en: "Live Clock", es: "Reloj en Vivo" },
  "live.1stHalf": { en: "1st Half", es: "1er Tiempo" },
  "live.2ndHalf": { en: "2nd Half", es: "2do Tiempo" },
  "live.onField": { en: "On Field", es: "En Cancha" },
  "live.rotationInterval": { en: "Rotation Interval: {time}", es: "Intervalo de Rotación: {time}" },
  "live.subReady": { en: "Sub Ready", es: "Listo" },
  "live.subNow": { en: "SUB NOW", es: "CAMBIAR" },
  "live.sub": { en: "SUB", es: "CAMB" },
  "live.played": { en: "Played: {time}", es: "Jugado: {time}" },
  "live.bench": { en: "Bench", es: "Banca" },
  "live.noBench": { en: "No bench players", es: "Sin jugadores en banca" },
  "live.resting": { en: "Resting: {time}", es: "Descansando: {time}" },
  "live.undoSub": { en: "Undo Sub", es: "Deshacer Cambio" },

  // Stats
  "stats.title": { en: "Stats", es: "Estadísticas" },
  "stats.startMatch": { en: "Start a match to see live statistics.", es: "Inicia un partido para ver estadísticas." },
  "stats.elapsed": { en: "Elapsed", es: "Tiempo" },
  "stats.subsMade": { en: "Subs Made", es: "Cambios" },
  "stats.players": { en: "Players", es: "Jugadores" },
  "stats.playTimeDistribution": { en: "Playing Time Distribution", es: "Distribución de Tiempo" },
  "stats.subLog": { en: "Substitution Log", es: "Registro de Cambios" },

  // No active match
  "noMatch.title": { en: "No Active Match", es: "Sin Partido Activo" },
  "noMatch.description": { en: "Set up your game and add players first, then start the match.", es: "Configura tu juego y añade jugadores primero, luego inicia el partido." },
  "noMatch.goToSetup": { en: "Go to Setup", es: "Ir a Configuración" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang, vars?: Record<string, string | number>): string {
  const entry = translations[key];
  let text: string = entry[lang] ?? entry.en;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}
