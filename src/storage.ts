// src/storage.ts — lectura y escritura de predicciones y resultados en localStorage

import type { Match, Prediction, PlayerKey } from "./types.js";

// Clave para predicción de un jugador en un partido específico
function predKey(player: PlayerKey, matchId: number): string {
  return `pred_${player}_partido${matchId}`;
}

// Clave para el resultado real de un partido
function resultKey(matchId: number): string {
  return `result_partido${matchId}`;
}

// Guarda la predicción de un jugador para un partido
export function savePrediction(player: PlayerKey, pred: Prediction): void {
  localStorage.setItem(predKey(player, pred.matchId), JSON.stringify(pred));
}

// Lee la predicción de un jugador para un partido (o null si no existe)
export function loadPrediction(
  player: PlayerKey,
  matchId: number
): Prediction | null {
  const raw = localStorage.getItem(predKey(player, matchId));
  return raw ? (JSON.parse(raw) as Prediction) : null;
}

// Guarda el resultado real de un partido (sobreescribe el campo en localStorage)
export function saveResult(matchId: number, scoreA: number, scoreB: number): void {
  localStorage.setItem(
    resultKey(matchId),
    JSON.stringify({ matchId, scoreA, scoreB })
  );
}

// Lee el resultado real de un partido (o null si no fue cargado)
export function loadResult(
  matchId: number
): { matchId: number; scoreA: number; scoreB: number } | null {
  const raw = localStorage.getItem(resultKey(matchId));
  return raw ? JSON.parse(raw) : null;
}

// Aplica los resultados guardados en localStorage sobre el array de partidos
export function applyStoredResults(matches: Match[]): Match[] {
  return matches.map((m) => {
    const stored = loadResult(m.id);
    if (stored) {
      return { ...m, realScoreA: stored.scoreA, realScoreB: stored.scoreB };
    }
    return m;
  });
}

// Borra TODAS las claves del localStorage (reseteo completo)
export function clearAll(): void {
  localStorage.clear();
}
