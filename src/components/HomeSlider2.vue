<template>
  <div class="ranking-wrapper">
    <BaseSlider
      v-if="filteredRankings.length > 0"
      title="Mitgemacht"
      :items="filteredRankings"
      sliderId="ranking-slider"
      containerClass="container ranking-section"
    >
      <!-- 🎯 Filter sitzt jetzt direkt unter dem H2 im Slider -->
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
          <span class="filterbar__count">{{ filteredRankings.length }} / {{ rankings.length }}</span>
        </div>
      </template>


      <!-- Cards -->
      <template #default="{ item }">
        <div class="game-header">
          <b>{{ item.gameName }}</b>
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
              <strong v-html="highlight(result.teamName)"></strong>
            </template>
            <template v-else>
              <strong v-html="highlight(result.teamName)"></strong>
            </template>

            <span v-if="result.gameType === 'Mini' || result.gameType === 'Medi'">
              {{ result.stars }} Sterne
            </span>
            <span v-else>
              {{ parseInt(result.duration.split('h')[1]) }} Min.
            </span>
          </li>
        </ul>
      </template>
    </BaseSlider>

    <!-- Keine Treffer -->
    <div v-else class="container ranking-empty">
      <p>Keine Ergebnisse für „{{ searchQuery }}“ gefunden.</p>
      <button class="btn btn--secondary" @click="searchQuery = ''">Filter löschen</button>
    </div>
  </div>
</template>

<script>
import BaseSlider from "@/components/BaseSlider.vue";

export default {
  components: { BaseSlider },
  props: {
    rankings: { type: Array, default: () => [] },
  },
  data() {
    return { searchQuery: "" };
  },
  computed: {
    filteredRankings() {
      if (!this.searchQuery) return this.rankings;
      const q = this.normalize(this.searchQuery);
      return this.rankings.filter(item =>
        Array.isArray(item.topResults) &&
        item.topResults.some(r => this.normalize(r.teamName || "").includes(q))
      );
    },
  },
  methods: {
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

      // eslint-konform: keine konstante Bedingung
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
      if (!results.length) return "";
      return results[0].gameType;
    },
    getSortedResults(item) {
      const results = [...(item.topResults || [])];
      const gameType = this.getGameType(results);

      if (gameType === "Mini") {
        return results.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      } else if (gameType === "Medi") {
        return results.sort((a, b) => b.stars - a.stars);
      } else {
        return results.sort((a, b) => {
          const timeToMinutes = (duration = "") => {
            const hMatch = duration.match(/(\d+)h/);
            const mMatch = duration.match(/(\d+)m/);
            const hours = hMatch ? parseInt(hMatch[1]) : 0;
            const minutes = mMatch ? parseInt(mMatch[1]) : 0;
            return hours * 60 + minutes;
          };
          return timeToMinutes(a.duration) - timeToMinutes(b.duration);
        });
      }
    },
  },
};
</script>

<style scoped>
/* Grundlayout: Mobile-First */
.filterbar {
  display: grid;
  grid-template-columns: 1fr auto; /* Input+Clear in Spalte 1, Count in Spalte 2 */
  gap: .5rem;
  align-items: center;
}

.filterbar__field {
  display: grid;
  grid-template-columns: 1fr auto; /* Input | Clear */
  gap: .5rem;
  width: 100%; /* Mobile: volle Breite */
}

.filterbar__input {
  width: 100%;
  padding: .65rem .75rem;
  border: 1px solid #e3e6eb;
  border-radius: .75rem;
  font-size: .95rem;
}

.filterbar__clear {
  border: none;
  background: transparent;
  padding: .4rem .6rem;
  cursor: pointer;
  font-size: 1rem;
}

.filterbar__count {
  justify-self: end;
  font-size: .85rem;
  opacity: .7;
}

/* Desktop: kompakteres Feld rechtsbündig */
@media (min-width: 1024px) {
  .filterbar {
    grid-template-columns: auto;   /* alles in eine Zeile */
    justify-content: end;          /* Block nach rechts */
  }
  .filterbar__field {
    width: 320px;                  /* kompakte Breite */
  }
}

/* Optional: Tablet-Stufe (768–1023px) mit leicht größerem Feld */
@media (min-width: 768px) and (max-width: 1023.98px) {
  .filterbar__field {
    width: 420px;
    max-width: 100%;
  }
}

/* Markierung (falls noch nicht vorhanden) */
:deep(mark) {
  background: #fff6a6;
  padding: 0 .1em;
  border-radius: .2em;
}

</style>
