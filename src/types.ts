// src/types.ts — interfaces y tipos compartidos del proyecto

export interface Match {
  id: number;
  group: string;
  teamA: string;
  teamB: string;
  date: string;
  realScoreA: number | null;
  realScoreB: number | null;
}

export interface Prediction {
  matchId: number;
  predA: number;
  predB: number;
}

// "jugador1" o "jugador2"
export type PlayerKey = "jugador1" | "jugador2";

// Nombres para mostrar en pantalla
export const PLAYER_NAMES: Record<PlayerKey, string> = {
  jugador1: "Jugador 1",
  jugador2: "Jugador 2",
};

// Nombres de las vistas disponibles
export type View = "selector" | "predictions" | "admin" | "leaderboard";
