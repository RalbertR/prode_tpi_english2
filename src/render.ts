// src/render.ts — genera el HTML dinámico de cada sección

import type { Match, PlayerKey } from "./types.js";
import { PLAYER_NAMES } from "./types.js";
import { loadPrediction } from "./storage.js";
import type { PlayerScore } from "./scoring.js";

// Twemoji se carga vía CDN en index.html; convierte los emojis de bandera
// en imágenes SVG porque Windows no tiene fuente para renderizarlos.
declare const twemoji: { parse(node: HTMLElement): void } | undefined;

function applyFlagIcons(container: HTMLElement): void {
  twemoji?.parse(container);
}

// Genera las tarjetas de predicción para un jugador
export function renderPredictionForm(
  container: HTMLElement,
  matches: Match[],
  player: PlayerKey
): void {
  container.innerHTML = matches
    .map((m) => {
      const saved = loadPrediction(player, m.id);
      const valA = saved ? saved.predA : "";
      const valB = saved ? saved.predB : "";

      return `
        <div class="match-card">
          <div class="match-group">Grupo ${m.group}</div>
          <div class="match-date">${formatDate(m.date)}</div>
          <div class="match-row">
            <span class="team">${m.teamA}</span>
            <input
              type="number"
              class="score-input"
              name="scoreA_${m.id}"
              min="0"
              max="20"
              value="${valA}"
              placeholder="0"
            />
            <span class="vs">vs</span>
            <input
              type="number"
              class="score-input"
              name="scoreB_${m.id}"
              min="0"
              max="20"
              value="${valB}"
              placeholder="0"
            />
            <span class="team">${m.teamB}</span>
          </div>
        </div>
      `;
    })
    .join("");

  applyFlagIcons(container);
}

// Genera las tarjetas para cargar resultados reales
export function renderAdminForm(
  container: HTMLElement,
  matches: Match[]
): void {
  container.innerHTML = matches
    .map((m) => {
      const valA = m.realScoreA !== null ? m.realScoreA : "";
      const valB = m.realScoreB !== null ? m.realScoreB : "";

      return `
        <div class="match-card">
          <div class="match-group">Grupo ${m.group}</div>
          <div class="match-date">${formatDate(m.date)}</div>
          <div class="match-row">
            <span class="team">${m.teamA}</span>
            <input
              type="number"
              class="score-input"
              name="realA_${m.id}"
              min="0"
              max="20"
              value="${valA}"
              placeholder="0"
            />
            <span class="vs">vs</span>
            <input
              type="number"
              class="score-input"
              name="realB_${m.id}"
              min="0"
              max="20"
              value="${valB}"
              placeholder="0"
            />
            <span class="team">${m.teamB}</span>
          </div>
        </div>
      `;
    })
    .join("");

  applyFlagIcons(container);
}

// Genera el HTML del leaderboard
export function renderLeaderboard(
  container: HTMLElement,
  scores: PlayerScore[]
): void {
  // Ordenar de mayor a menor puntaje
  const sorted = [...scores].sort((a, b) => b.total - a.total);

  const medals = ["🥇", "🥈", "🥉"];

  container.innerHTML = `
    <div class="leaderboard">
      ${sorted
        .map(
          (s, i) => `
        <div class="leaderboard-card ${i === 0 ? "leader" : ""}">
          <span class="medal">${medals[i] ?? ""}</span>
          <span class="player-name">${PLAYER_NAMES[s.player]}</span>
          <span class="total-score">${s.total} pts</span>
        </div>
        <div class="match-detail">
          ${s.detail
            .map(
              (d) => `
            <div class="detail-row">
              <span class="detail-match">${d.match.teamA} vs ${d.match.teamB}</span>
              <span class="detail-pred">
                ${
                  d.prediction
                    ? `Pronóstico: ${d.prediction.predA}-${d.prediction.predB}`
                    : "Sin pronóstico"
                }
              </span>
              <span class="detail-real">
                ${
                  d.match.realScoreA !== null
                    ? `Real: ${d.match.realScoreA}-${d.match.realScoreB}`
                    : "Pendiente"
                }
              </span>
              <span class="detail-points points-${d.points}">${d.points} pts</span>
            </div>
          `
            )
            .join("")}
        </div>
      `
        )
        .join("")}
    </div>
  `;

  applyFlagIcons(container);
}

// Formatea "2026-06-20" como "20/06/2026"
function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}
