<template>
  <div class="ranking-wrapper">
    <BaseSlider
      v-if="participatedRankings.length > 0"
      title="Mitgemacht"
      :items="filteredRankings"
      sliderId="ranking-slider"
      containerClass="container ranking-section"
    >
      <!-- 🎯 Filter sitzt direkt unter dem H2 im Slider -->
      <template #below-title>
        <div class="filterbar">
          <div class="filterbar__field">
            <input
              v-model.trim="searchQuery"
              type="search"
              class="filterbar__input"
              placeholder="Nach Teamnamen suchen…"
              aria-label="Mitgemacht filtern"
            />
            <button
              v-if="searchQuery"
              class="filterbar__clear"
              @click="searchQuery = ''"
              aria-label="Filter zurücksetzen"
            ></button>
          </div>
        </div>

        <!-- Hinweis, wenn keine Treffer → es werden alle 'Mitgemacht'-Spiele gezeigt -->
        <p v-if="searchQuery && matchCount === 0" class="filterbar__info">
          Keine Treffer – zeige alle Spiele mit Ergebnissen.
        </p>
      </template>

      <!-- Cards -->
      <template #default="{ item }">
        <div class="game-header">
          <router-link 
            :to="item.landingPageUrl" 
            class="game-link"
          >
            <b>{{ item.gameName }}</b>
          </router-link>

          <img
            v-if="getGameType(item.topResults) === 'Mini'"
            src="@/assets/img/icons/hand.png"
            alt="Mini Icon"
          />
          <img
            v-else-if="getGameType(item.topResults) === 'Medi'"
            src="@/assets/img/icons/sterne.png"
            alt="Medi Icon"
          />
          <img
            v-else
            src="@/assets/img/icons/krone.png"
            alt="Default Icon"
          />
        </div>

        <span class="game-type">{{ getGameType(item.topResults) }}</span>
        <ul>
          <li v-for="(result, idx) in getSortedResults(item)" :key="idx">
            <template v-if="result.gameType === 'Maxi'">
              <strong>{{ idx + 1 }}. </strong>
              <strong v-html="highlight(fallbackTeamName(result))"></strong>
            </template>
            <template v-else>
              <strong v-html="highlight(fallbackTeamName(result))"></strong>
            </template>

            <span v-if="result.gameType === 'Mini' || result.gameType === 'Medi'">
              {{ result.stars }} Sterne
            </span>
            <span v-else>
              {{ minutesFromDuration(result.duration) }} Min.
            </span>
          </li>
        </ul>
      </template>
    </BaseSlider>

    <!-- Optional: Leerer Zustand -->
    <p v-else class="filterbar__info">Noch keine Ergebnisse vorhanden.</p>
  </div>
</template>

<script>
import BaseSlider from "@/components/BaseSlider.vue";

export default {
  components: { BaseSlider },
  props: {
    /**
     * Erwartete Struktur je Item:
     * {
     *   gameName: string,
     *   landingPageUrl: string | route,
     *   topResults: Array<{ teamName? | name? | team?, duration?, stars?, gameType?, startTime? }>
     * }
     */
    rankings: { type: Array, default: () => [] },
  },
  data() {
    return { searchQuery: "" };
  },
  computed: {
    // ✅ Nur Spiele, bei denen schon jemand gespielt hat (mind. 1 Ergebnis) – OHNE teamName-Zwang
    participatedRankings() {
      return (this.rankings || []).filter(
        (item) => Array.isArray(item.topResults) && item.topResults.length > 0
      );
    },

    // echtes Filterergebnis basierend auf participatedRankings
    rawFiltered() {
      if (!this.searchQuery) return this.participatedRankings;
      const q = this.normalize(this.searchQuery);
      return this.participatedRankings.filter(item =>
        Array.isArray(item.topResults) &&
        item.topResults.some(r => this.normalize(this.fallbackTeamName(r)).includes(q))
      );
    },

    // Fallback zeigt ALLE mit Ergebnissen (nicht alle Rankings)
    filteredRankings() {
      if (this.searchQuery && this.rawFiltered.length === 0) {
        return this.participatedRankings;
      }
      return this.rawFiltered;
    },

    // Zähler zeigt echte Trefferzahl (0..N) innerhalb der "Mitgemacht"-Menge
    matchCount() {
      return this.searchQuery ? this.rawFiltered.length : this.participatedRankings.length;
    },
  },
  methods: {
    // --- Namens-Fallback für inkonsistente Result-Felder ---
    fallbackTeamName(result = {}) {
      return (
        (result.teamName && String(result.teamName).trim()) ||
        (result.name && String(result.name).trim()) ||
        (result.team && String(result.team).trim()) ||
        "Unbenanntes Team"
      );
    },

    // --- Dauer zu Minuten (robust für "1h 23m 10s" / "23m 10s" / "45s" / "HH:MM:SS") ---
    minutesFromDuration(duration = "") {
      if (typeof duration === "number" && Number.isFinite(duration)) {
        // Falls in Sekunden gespeichert:
        return Math.round(duration / 60);
      }
      const d = String(duration);
      // Muster "1h 23m 10s" etc.
      const h = (d.match(/(\d+)\s*h/i) || [])[1] || 0;
      const m = (d.match(/(\d+)\s*m/i) || [])[1] || 0;
      const s = (d.match(/(\d+)\s*s/i) || [])[1] || 0;
      if (h || m || s) return Number(h) * 60 + Number(m) + Math.round(Number(s) / 60);

      // "HH:MM:SS" oder "MM:SS"
      const parts = d.split(":").map(n => parseInt(n, 10));
      if (parts.every(n => Number.isFinite(n))) {
        if (parts.length === 3) return parts[0] * 60 + parts[1] + Math.round(parts[2] / 60);
        if (parts.length === 2) return parts[0] + Math.round(parts[1] / 60);
      }
      // Fallback: 0
      return 0;
    },

    // --- Highlight-Helfer ---
    normalize(str = "") {
      return String(str).toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    },
    escapeHtml(str = "") {
      return String(str)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    },
    stripDiacriticsWithMap(original = "") {
      const map = [];
      let normalized = "";
      for (let i = 0; i < original.length; i++) {
        const nfd = original[i].normalize("NFD").replace(/\p{Diacritic}/gu, "");
        for (let j = 0; j < nfd.length; j++) {
          normalized += nfd[j];
          map.push(i);
        }
      }
      return { normalized, map };
    },
    highlight(text = "") {
      const query = this.searchQuery;
      if (!query) return this.escapeHtml(text);
      const qNorm = this.normalize(query);
      if (!qNorm) return this.escapeHtml(text);

      const { normalized, map } = this.stripDiacriticsWithMap(text);
      const hay = normalized.toLowerCase();
      const needle = qNorm;

      let pos = 0;
      let currOrig = 0;
      const parts = [];

      while (pos < hay.length) {
        const idx = hay.indexOf(needle, pos);
        if (idx === -1) break;

        const startOrig = map[idx];
        const endOrig = (idx + needle.length < map.length) ? map[idx + needle.length] : text.length;

        if (currOrig < startOrig) {
          parts.push(this.escapeHtml(text.slice(currOrig, startOrig)));
        }
        parts.push("<mark>" + this.escapeHtml(text.slice(startOrig, endOrig)) + "</mark>");

        currOrig = endOrig;
        pos = idx + needle.length;
      }
      if (currOrig < text.length) parts.push(this.escapeHtml(text.slice(currOrig)));
      return parts.join("");
    },

    // --- Vorhandene Logik ---
    getGameType(results = []) {
      if (!Array.isArray(results) || results.length === 0) return "";
      return results[0].gameType || ""; // fallback leer, wenn nicht vorhanden
    },
    getSortedResults(item) {
      const results = [...(item.topResults || [])];
      const gameType = this.getGameType(results);

      if (gameType === "Mini") {
        return results.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      } else if (gameType === "Medi") {
        return results.sort((a, b) => (b.stars || 0) - (a.stars || 0));
      } else {
        // Maxi / default: nach Dauer aufsteigend
        return results.sort((a, b) => this.minutesFromDuration(a.duration) - this.minutesFromDuration(b.duration));
      }
    },
  },
};
</script>

<style scoped>
/* (unverändert) */
.filterbar {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
}
.filterbar__field {
  display: grid;
  grid-template-columns: 1fr auto;
  width: 100%;
}
.filterbar__input {
  width: 100%;
  padding: .65rem .75rem;
  border: 1px solid #355b4c;
  border-radius: .75rem;
  font-size: .95rem;
  color: #FAC227;
  background-color: #355b4c;
}
.filterbar__input::placeholder,
.filterbar__input::-webkit-input-placeholder {
  color: #FAC227;
  opacity: 1;
}
.filterbar__input:focus::placeholder { color: #FAC227; }
.filterbar__clear {
  border: none;
  background: transparent;
  padding: .4rem .6rem;
  cursor: pointer;
  font-size: 1rem;
}
.filterbar__count { justify-self: end; font-size: .85rem; opacity: .7; }
.filterbar__info { margin-top: .35rem; font-size: .85rem; opacity: .75; }

/* Desktop kompakter */
@media (min-width: 1024px) {
  .filterbar { justify-content: flex-end; display: flex; }
  .filterbar__field { width: 320px; }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023.98px) {
  .filterbar__field { width: 420px; max-width: 100%; }
}

/* Markierung */
:deep(mark) {
  background: #fff6a6;
  padding: 0 .1em;
  border-radius: .2em;
}
.filterbar__input::placeholder { color: #FAC227; opacity: 1; }
.filterbar__input::-webkit-input-placeholder { color: #FAC227; opacity: 1; }
.filterbar__input:focus::placeholder { color: #FAC227; }
</style>
