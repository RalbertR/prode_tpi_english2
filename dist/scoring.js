// src/scoring.ts — cálculo de puntos por partido y puntaje total
import { loadPrediction } from "./storage.js";
// Calcula los puntos de una predicción contra el resultado real
// 3 pts: marcador exacto; 1 pt: resultado general correcto; 0 pts: fallo
export function calcPoints(pred, match) {
    if (match.realScoreA === null || match.realScoreB === null)
        return 0;
    const exactA = pred.predA === match.realScoreA;
    const exactB = pred.predB === match.realScoreB;
    if (exactA && exactB)
        return 3;
    const predWinner = Math.sign(pred.predA - pred.predB);
    const realWinner = Math.sign(match.realScoreA - match.realScoreB);
    if (predWinner === realWinner)
        return 1;
    return 0;
}
// Calcula el puntaje completo de un jugador sobre todos los partidos
export function calcPlayerScore(player, matches) {
    const detail = matches.map((match) => {
        const prediction = loadPrediction(player, match.id);
        const points = prediction ? calcPoints(prediction, match) : 0;
        return { match, prediction, points };
    });
    const total = detail.reduce((acc, d) => acc + d.points, 0);
    return { player, total, detail };
}
