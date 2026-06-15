// src/main.ts — inicialización, navegación entre vistas, event listeners

import type { Match, PlayerKey, View } from "./types.js";
import {
  savePrediction,
  saveResult,
  applyStoredResults,
  clearAll,
} from "./storage.js";
import { calcPlayerScore } from "./scoring.js";
import {
  renderPredictionForm,
  renderAdminForm,
  renderLeaderboard,
} from "./render.js";

// Estado global de la app
let allMatches: Match[] = [];
let currentPlayer: PlayerKey = "jugador1";

// Carga los partidos desde el JSON estático
async function loadMatches(): Promise<Match[]> {
  const response = await fetch("data/matches.json");
  const data: Match[] = await response.json();
  return data;
}

// Muestra solo la vista indicada, oculta el resto
function showView(view: View): void {
  const views = document.querySelectorAll<HTMLElement>(".view");
  views.forEach((v) => v.classList.remove("active"));
  document.getElementById(`view-${view}`)?.classList.add("active");
}

// Inicializa la vista de predicciones para el jugador actual
function openPredictions(player: PlayerKey): void {
  currentPlayer = player;
  const title = document.getElementById("predictions-title");
  const label = player === "jugador1" ? "Jugador 1" : "Jugador 2";
  if (title) title.textContent = `Predicciones — ${label}`;

  // Mostrar badge del jugador activo en el navbar
  const badge = document.getElementById("nav-player-badge") as HTMLElement | null;
  if (badge) { badge.textContent = `👤 ${label}`; badge.hidden = false; }

  const container = document.getElementById("matches-container");
  if (container) renderPredictionForm(container, allMatches, player);

  showView("predictions");
}

// Inicializa la vista de administrador con resultados actuales
function openAdmin(): void {
  const withResults = applyStoredResults(allMatches);
  const container = document.getElementById("admin-matches-container");
  if (container) renderAdminForm(container, withResults);
  showView("admin");
}

// Calcula y muestra el leaderboard
function openLeaderboard(): void {
  const withResults = applyStoredResults(allMatches);
  const scores = (["jugador1", "jugador2"] as PlayerKey[]).map((p) =>
    calcPlayerScore(p, withResults)
  );
  const container = document.getElementById("leaderboard-container");
  if (container) renderLeaderboard(container, scores);
  showView("leaderboard");
}

// Registra todos los event listeners cuando el DOM está listo
function init(): void {
  // Botones de selección de jugador
  document.querySelectorAll<HTMLButtonElement>(".btn-player").forEach((btn) => {
    btn.addEventListener("click", () => {
      const player = btn.dataset.player as PlayerKey;
      openPredictions(player);
    });
  });

  // Navbar
  document.getElementById("btn-nav-home")?.addEventListener("click", () => showView("selector"));
  document.getElementById("btn-nav-leaderboard")?.addEventListener("click", openLeaderboard);
  document.getElementById("btn-nav-admin")?.addEventListener("click", openAdmin);

  // Botón ir a admin (selector view)
  document.getElementById("btn-go-admin")?.addEventListener("click", openAdmin);

  // Botones "volver"
  document.getElementById("btn-back-from-predictions")?.addEventListener("click", () => showView("selector"));
  document.getElementById("btn-back-from-admin")?.addEventListener("click", () => showView("selector"));
  document.getElementById("btn-back-from-leaderboard")?.addEventListener("click", () => showView("selector"));

  // Botón ir a leaderboard desde predicciones
  document.getElementById("btn-go-leaderboard")?.addEventListener("click", openLeaderboard);

  // Formulario de predicciones
  document.getElementById("form-predictions")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    allMatches.forEach((match) => {
      const rawA = formData.get(`scoreA_${match.id}`);
      const rawB = formData.get(`scoreB_${match.id}`);
      if (rawA !== null && rawB !== null) {
        savePrediction(currentPlayer, {
          matchId: match.id,
          predA: Number(rawA),
          predB: Number(rawB),
        });
      }
    });

    alert("✅ Predicciones guardadas correctamente");
  });

  // Formulario de resultados reales
  document.getElementById("form-admin")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    allMatches.forEach((match) => {
      const rawA = formData.get(`realA_${match.id}`);
      const rawB = formData.get(`realB_${match.id}`);
      if (rawA !== null && rawB !== null && rawA !== "" && rawB !== "") {
        saveResult(match.id, Number(rawA), Number(rawB));
      }
    });

    alert("✅ Resultados guardados correctamente");
  });

  // Botón resetear
  document.getElementById("btn-reset")?.addEventListener("click", () => {
    if (confirm("¿Seguro que querés borrar todas las predicciones y resultados?")) {
      clearAll();
      alert("🗑️ Todo borrado. Recargá la página para empezar de nuevo.");
    }
  });
}

// Punto de entrada
loadMatches()
  .then((matches) => {
    allMatches = matches;
    init();
  })
  .catch((err) => {
    console.error("Error al cargar partidos:", err);
    alert("No se pudieron cargar los partidos. Verificar data/matches.json");
  });
