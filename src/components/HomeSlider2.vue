<template>
  <div class="ranking-wrapper">
    <BaseSlider
      v-if="participatedRankings.length > 0"
      title="Mitgemacht"
      :items="filteredRankings"
      sliderId="ranking-slider"
      containerClass="container ranking-section"
    >
      <!-- 🎯 Filter direkt unter dem Titel -->
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
            />
          </div>
        </div>

        <p v-if="searchQuery && matchCount === 0" class="filterbar__info">
          Keine Treffer – zeige alle Spiele mit Ergebnissen.
        </p>
      </template>

      <!-- Karten -->
      <template #default="{ item }">
        <div class="game-header">
          <router-link :to="item.landingPageUrl" class="game-link">
            <b>{{ item.gameName }}</b>
          </router-link>

          <!-- Icon je gameType -->
          <img
            v-if="gameTypeRaw(item) === 'Mini'"
            src="@/assets/img/icons/hand.png"
            alt="Mini Icon"
          />
          <img
            v-else-if="gameTypeRaw(item) === 'Medi'"
            src="@/assets/img/icons/sterne.png"
            alt="Medi Icon"
          />
          <img
            v-else
            src="@/assets/img/icons/krone.png"
            alt="Maxi Icon"
          />
        </div>

        <!-- Label + Klassenname direkt aus gameType -->
        <span :class="`game-type game-type-${gameTypeRaw(item)}`">
          {{ gameTypeRaw(item) }}
        </span>

        <!-- Ergebnisliste: Klassenname direkt an gameType anhängen -->
        <ul :class="`results game-type-${gameTypeRaw(item)}`">
          <li
            v-for="(result, idx) in getSortedResults(item)"
            :key="resultKey(result, idx)"
          >
            <!-- Rangnummer nur bei Maxi -->
            <template v-if="gameTypeRaw(item) === 'Maxi'">
              <strong>{{ idx + 1 }}. </strong>
            </template>

            <strong v-html="highlight(fallbackTeamName(result))"></strong>

            <!-- Mini/Medi: Sterne, Maxi: Zeit -->
            <span v-if="gameTypeRaw(item) === 'Mini' || gameTypeRaw(item) === 'Medi'">
              {{ toNumberStars(result.stars) }} Sterne
            </span>
            <span v-else>
              {{ toMinutes(result.duration) }} Min.
            </span>
          </li>
        </ul>
      </template>
    </BaseSlider>

    <p v-else class="filterbar__info">Noch keine Ergebnisse vorhanden.</p>
  </div>
</template>

<script>
import BaseSlider from "@/components/BaseSlider.vue";

export default {
  name: "HomeSlider2",
  components: { BaseSlider },
  props: {
    /**
     * items-Struktur:
     * {
     *   gameName: string,
     *   landingPageUrl: string,
     *   topResults: Array<{
     *     teamName?: string, name?: string, team?: string,
     *     duration?: string|number,
     *     stars?: string|number,
     *     gameType: 'Mini'|'Medi'|'Maxi',
     *     startTime?: string|Date
     *   }>
     * }
     */
    rankings: { type: Array, default: () => [] },
  },
  data() {
    return { searchQuery: "" };
  },
  computed: {
    participatedRankings() {
      return (this.rankings || []).filter(
        (item) => Array.isArray(item.topResults) && item.topResults.length > 0
      );
    },
    rawFiltered() {
      if (!this.searchQuery) return this.participatedRankings;
      const q = this.normalize(this.searchQuery);
      return this.participatedRankings.filter(item =>
        item.topResults.some(r => this.normalize(this.fallbackTeamName(r)).includes(q))
      );
    },
    filteredRankings() {
      if (this.searchQuery && this.rawFiltered.length === 0) return this.participatedRankings;
      return this.rawFiltered;
    },
    matchCount() {
      return this.searchQuery ? this.rawFiltered.length : this.participatedRankings.length;
    },
  },
  methods: {
    // --- gameType 1:1 aus den Daten (ohne Mapping/Lowercasing) ---
    gameTypeRaw(item) {
      // nimmt zuerst gameType am Item, sonst vom ersten Result
      return (item?.gameType || item?.topResults?.[0]?.gameType || "").toString();
    },

    // --- Sortierung je Typ (Mini=neueste, Medi=sterne, Maxi=Zeit) ---
    getSortedResults(item) {
      const results = [...(item?.topResults || [])];
      const t = this.gameTypeRaw(item);

      if (t === "Mini") {
        return results.sort((a, b) => new Date(b.startTime || 0) - new Date(a.startTime || 0));
      } else if (t === "Medi") {
        return results.sort((a, b) => this.toNumberStars(b.stars) - this.toNumberStars(a.stars));
      }
      // Maxi / default: nach Dauer (Minuten) aufsteigend
      return results.sort((a, b) => this.minutesFromDuration(a.duration) - this.minutesFromDuration(b.duration));
    },

    // ---------- Helfer ----------
    resultKey(r = {}, idx) {
      return [r._id, r.teamName, r.name, r.team, r.startTime, idx].filter(Boolean).join(':');
    },
    fallbackTeamName(result = {}) {
      return (
        (result.teamName && String(result.teamName).trim()) ||
        (result.name && String(result.name).trim()) ||
        (result.team && String(result.team).trim()) ||
        "Unbenanntes Team"
      );
    },
    toNumberStars(v) {
      if (typeof v === "number") return Number.isFinite(v) ? v : 0;
      const n = Number(String(v ?? "").trim());
      return Number.isFinite(n) ? n : 0;
    },

    minutesFromDuration(duration = "") {
      if (typeof duration === "number" && Number.isFinite(duration)) {
        const secs = duration > 1e6 ? Math.round(duration / 1000) : duration;
        return Math.max(0, Math.round(secs / 60));
      }
      const asNumber = Number(String(duration).trim());
      if (Number.isFinite(asNumber) && String(duration).trim() !== "") {
        const secs = asNumber > 1e6 ? Math.round(asNumber / 1000) : asNumber;
        return Math.max(0, Math.round(secs / 60));
      }
      const s = String(duration).trim();
      const hms = s.match(/(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?\s*(?:(\d+)\s*s)?/i);
      if (hms && (hms[1] || hms[2] || hms[3])) {
        const h = parseInt(hms[1] || "0", 10);
        const m = parseInt(hms[2] || "0", 10);
        const sec = parseInt(hms[3] || "0", 10);
        return h * 60 + m + Math.round(sec / 60);
      }
      const parts = s.split(":").map(n => parseInt(n, 10));
      if (parts.every(n => Number.isFinite(n))) {
        if (parts.length === 3) {
          const secs = parts[0] * 3600 + parts[1] * 60 + parts[2];
          return Math.max(0, Math.round(secs / 60));
        }
        if (parts.length === 2) {
          const secs = parts[0] * 60 + parts[1];
          return Math.max(0, Math.round(secs / 60));
        }
      }
      return 0;
    },
    toMinutes(duration) {
      return this.minutesFromDuration(duration);
    },

    // ---------- Suche/Highlight ----------
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
  },
};
</script>

<style scoped>
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

/* Debug-Rohdaten optisch klein halten */
.debug-raw { margin-left: .35rem; opacity: .7; font-size: .8em; }

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
