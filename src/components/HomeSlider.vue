<template>
  <BaseSlider
    title="Wähle dein Spiel!"
    :items="filteredGames"
    sliderId="game-preview-section"
    containerClass="container game-preview-section"
  >
    <!-- 🎯 Filter direkt unter dem H2 -->
    <template #below-title>
      <div class="filters">
        <!-- PLZ -->
        <div class="filters__field filters__plz">
          <label for="filter-plz" class="sr-only">PLZ</label>
          <input
            id="filter-plz"
            ref="plzInput"
            v-model="plzQuery"
            @input="onPlzInput"
            @focus="onPlzFocus"
            @blur="onPlzBlur"
            @keydown="onPlzKeydown"
            type="search"
            class="filters__input"
            placeholder="Suche deine PLZ "
            inputmode="numeric"
            autocomplete="postal-code"
            :aria-expanded="showPlzMenu && plzSuggestions.length > 0 ? 'true' : 'false'"
            aria-haspopup="listbox"
            aria-controls="plz-listbox"
            :aria-activedescendant="plzActiveIndex >= 0 ? `plz-opt-${plzActiveIndex}` : null"
          />
          <button
            v-if="plzQuery"
            class="filters__clear"
            @mousedown.prevent
            @click="clearPlz"
            aria-label="PLZ löschen"
          >✕</button>

          <!-- 🔽 Autocomplete Dropdown -->
          <ul
            v-if="showPlzMenu && plzSuggestions.length"
            id="plz-listbox"
            class="filters__autocomplete"
            role="listbox"
          >
            <li
              v-for="(s, i) in plzSuggestions"
              :key="s"
              :id="`plz-opt-${i}`"
              role="option"
              :aria-selected="i === plzActiveIndex"
              :class="['filters__opt', { 'is-active': i === plzActiveIndex }]"
              @mousedown.prevent="applyPlzSuggestion(s)"
              @mousemove="plzActiveIndex = i"
            >
              {{ s }}
            </li>
          </ul>
        </div>

        <!-- Altersgruppe -->
        <div class="filters__field filters__age">
          <div class="segmented" role="tablist" aria-label="Altersgruppe filtern">
            <button
              type="button"
              class="segmented__btn"
              :class="{ 'is-active': selectedAge === 'Alle' }"
              @click="selectedAge = 'Alle'"
              :aria-pressed="selectedAge === 'Alle'"
            >Alle</button>
            <button
              type="button"
              class="segmented__btn"
              :class="{ 'is-active': selectedAge === 'Mini' }"
              @click="selectedAge = 'Mini'"
              :aria-pressed="selectedAge === 'Mini'"
            >Mini</button>
            <button
              type="button"
              class="segmented__btn"
              :class="{ 'is-active': selectedAge === 'Medi' }"
              @click="selectedAge = 'Medi'"
              :aria-pressed="selectedAge === 'Medi'"
            >Medi</button>
            <button
              type="button"
              class="segmented__btn"
              :class="{ 'is-active': selectedAge === 'Maxi' }"
              @click="selectedAge = 'Maxi'"
              :aria-pressed="selectedAge === 'Maxi'"
            >Maxi</button>
          </div>
        </div>
      </div>

      <!-- Hinweis bei 0 Treffern (es werden alle gezeigt) -->
      <p v-if="(plzQuery || selectedAge !== 'Alle') && matchCount === 0" class="filters__info">
        Keine Treffer – zeige alle Spiele.
      </p>
    </template>

    <!-- Cards / jeder Slide hat EINEN Root-Wrapper -->
    <template #default="{ item, index }">
      <div class="slide-inner">
        <div class="short-description">
          <img
            :src="getGameImagePath(item.gameImage)"
            :alt="item.name"
            class="image-game"
          />

          <!-- Badge: PLZ · Altersgruppe -->
          <div
            class="card-badge"
            :aria-label="`PLZ ${getGamePlzDisplay(item) || 'unbekannt'} – ${formatAge(item.ageGroup)}`"
          >
            <span class="card-badge__text">
              {{ getGamePlzDisplay(item) || '—' }} · {{ formatAge(item.ageGroup) }}
            </span>
          </div>

          <div class="headline-game-name">
            <h2>{{ item.name }}</h2>
          </div>
          <div class="short">
            <div class="short-left">
              <b>{{ item.startloction }}</b>
            </div>
            <div class="game-infos" @click="toggleLayer(index)">
              <b>{{ item.ageGroup }}</b>
              <img src="@/assets/img/icons/open-plus.png" alt="open" class="open-layer" />
            </div>
            <div class="short-right">
              <div class="button">
                <button
                  class="btn btn--fourth"
                  @click="$emit('open-modal', item)"
                >
                  Kaufen
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Long-description -->
        <div
          class="long-description"
          :class="{ 'long-description-active': activeIndex === index }"
        >
          <div class="long-description-content">
            <div class="top-content">
              <div class="top-info">
                <b>{{ item.name }}</b>
              </div>
              <div class="close-btn" @click="closeLayer">
                <font-awesome-icon
                  icon="minus-circle"
                  class="close-icon-2"
                  aria-label="Schließen"
                />
              </div>
            </div>
            <div class="game-information">
              <div class="game-infos">
                <p>
                  <span>Schwierigkeit:</span>
                  <span>{{ item.ageGroup }}</span>
                </p>
                <p>
                  <span>Start:</span>
                  <span>{{ item.startloction }}</span>
                </p>
                <p>
                  <span>Dauer:</span>
                  <span>{{ item.playtime }}</span>
                </p>
                <p>
                  <span>Ende:</span>
                  <span>{{ item.endloction }}</span>
                </p>
                <p>
                  <span>Preis:</span>
                  <span>{{ item.price }}</span>
                </p>
              </div>
            </div>
            <div class="game-description">
              <span>Was wir wissen:</span>
              <span>{{ item.description }}</span>
            </div>

            <div class="button">
              <button
                class="btn btn--primary"
                @click="$emit('open-modal', item.encryptedId)"
              >
                Kaufen
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </BaseSlider>
</template>

<script>
import BaseSlider from "@/components/BaseSlider.vue";

export default {
  name: "HomeSlider",
  components: { BaseSlider },
  props: {
    games: { type: Array, default: () => [] },
  },
  data() {
    return {
      activeIndex: null,
      plzQuery: "",
      selectedAge: "Alle",
      // 👇 Autocomplete State
      showPlzMenu: false,
      plzActiveIndex: -1,
    };
  },
  computed: {
    // alle verfügbaren PLZs (einmalig aus den Games extrahiert)
    plzCandidates() {
      const set = new Set();
      for (const g of this.games || []) {
        const a = this.extractPlz(String(g.plz ?? ""));
        const b = this.extractPlz(String(g.startloction ?? ""));
        const c = this.extractPlz(String(g.endloction ?? ""));
        const d = this.extractPlz(String(g.city ?? ""));
        if (a) set.add(a);
        if (b) set.add(b);
        if (c) set.add(c);
        if (d) set.add(d);
      }
      // sortiert aufsteigend numerisch (Fallback: string)
      return Array.from(set).sort((x, y) => {
        const nx = parseInt(x, 10); const ny = parseInt(y, 10);
        return isNaN(nx) || isNaN(ny) ? x.localeCompare(y) : nx - ny;
      });
    },
    // Vorschläge ab der 2. Ziffer, Prefix-Match
    plzSuggestions() {
      const q = this.normalizePlz(this.plzQuery);
      if (q.length < 2) return [];
      const out = [];
      for (const s of this.plzCandidates) {
        if (this.normalizePlz(s).startsWith(q)) out.push(s);
        if (out.length >= 8) break; // max 8 Vorschläge
      }
      return out;
    },

    // echtes Filterergebnis (kann 0 sein)
    rawFiltered() {
      let list = this.games || [];

      // PLZ: normalisieren & Prefix-Match über mehrere Felder
      const qDigits = this.normalizePlz(this.plzQuery);
      if (qDigits) {
        list = list.filter((g) => this.getGamePlz(g).startsWith(qDigits));
      }

      // Altersgruppe
      if (this.selectedAge !== "Alle") {
        const age = String(this.selectedAge).toLowerCase();
        list = list.filter(
          (g) => String(g.ageGroup || "").toLowerCase() === age
        );
      }

      return list;
    },

    // Fallback: bei 0 Treffern alle Spiele anzeigen
    filteredGames() {
      if (
        (this.plzQuery || this.selectedAge !== "Alle") &&
        this.rawFiltered.length === 0
      ) {
        return this.games;
      }
      return this.rawFiltered;
    },

    // Anzeige der echten Trefferzahl
    matchCount() {
      if (this.plzQuery || this.selectedAge !== "Alle") {
        return this.rawFiltered.length;
      }
      return this.games.length;
    },
  },
  methods: {
    // -------- Autocomplete UI --------
    onPlzInput(e) {
      const digits = (e.target.value || "").replace(/\D/g, "").slice(0, 5);
      this.plzQuery = digits;
      // Dropdown nur ab 2 Ziffern
      this.showPlzMenu = this.plzQuery.length >= 2 && this.plzSuggestions.length > 0;
      if (!this.showPlzMenu) this.plzActiveIndex = -1;
    },
    onPlzFocus() {
      this.showPlzMenu = this.plzQuery.length >= 2 && this.plzSuggestions.length > 0;
    },
    onPlzBlur() {
      // kurz verzögert, damit click auf Option noch greift
      setTimeout(() => { this.showPlzMenu = false; this.plzActiveIndex = -1; }, 120);
    },
    onPlzKeydown(e) {
      if (!this.showPlzMenu && !(e.key === 'ArrowDown' && this.plzSuggestions.length)) return;
      if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) e.preventDefault();

      if (e.key === 'ArrowDown') {
        this.showPlzMenu = true;
        const last = this.plzSuggestions.length - 1;
        this.plzActiveIndex = this.plzActiveIndex < last ? this.plzActiveIndex + 1 : 0;
      } else if (e.key === 'ArrowUp') {
        const last = this.plzSuggestions.length - 1;
        this.plzActiveIndex = this.plzActiveIndex > 0 ? this.plzActiveIndex - 1 : last;
      } else if (e.key === 'Enter') {
        if (this.plzActiveIndex >= 0) this.applyPlzSuggestion(this.plzSuggestions[this.plzActiveIndex]);
        this.showPlzMenu = false;
      } else if (e.key === 'Escape') {
        this.showPlzMenu = false;
        this.plzActiveIndex = -1;
      }
    },
    applyPlzSuggestion(s) {
      this.plzQuery = this.normalizePlz(s).slice(0, 5); // übernehmen (nur Ziffern)
      this.showPlzMenu = false;
      this.plzActiveIndex = -1;
      this.$refs.plzInput?.focus();
    },
    clearPlz() {
      this.plzQuery = "";
      this.showPlzMenu = false;
      this.plzActiveIndex = -1;
      this.$refs.plzInput?.focus();
    },

    // -------- UI / Sonstiges --------
    getGameImagePath(imagePath) {
      try { return new URL(imagePath, import.meta.url).href; } catch { return imagePath; }
    },
    toggleLayer(index) { this.activeIndex = this.activeIndex === index ? null : index; }
    ,
    closeLayer() { this.activeIndex = null; },
    formatAge(age) {
      const a = String(age || "").toLowerCase();
      if (a === "mini") return "Mini";
      if (a === "medi") return "Medi";
      if (a === "maxi") return "Maxi";
      return age || "";
    },

    // -------- PLZ-Helper --------
    getGamePlzDisplay(g) {
      const fromPlz = this.extractPlz(String(g.plz ?? ""));
      if (fromPlz) return fromPlz;
      return (
        this.extractPlz(String(g.startloction ?? "")) ||
        this.extractPlz(String(g.endloction ?? "")) ||
        this.extractPlz(String(g.city ?? "")) ||
        ""
      );
    },
    getGamePlz(g) {
      const fromPlz = this.extractPlz(String(g.plz ?? ""));
      if (fromPlz) return this.normalizePlz(fromPlz);
      const fromStart = this.extractPlz(String(g.startloction ?? ""));
      if (fromStart) return this.normalizePlz(fromStart);
      const fromEnd = this.extractPlz(String(g.endloction ?? ""));
      if (fromEnd) return this.normalizePlz(fromEnd);
      const fromCity = this.extractPlz(String(g.city ?? ""));
      if (fromCity) return this.normalizePlz(fromCity);
      return "";
    },
    extractPlz(text = "") {
      const m = String(text).match(/\b\d{4,5}\b/);
      return m ? m[0] : "";
    },
    normalizePlz(val = "") {
      return String(val).replace(/\D/g, "").replace(/^0+/, "");
    },
  },
};
</script>

<style scoped>
/* ---------- Filterbar ---------- */
.filters {
  display: grid;
  gap: .5rem 0.75rem;
  align-items: center;
}
.slider-below-title { width: 95%; }

/* Mobile */
@media (max-width: 1023.98px) {
  .filters { grid-template-columns: 1fr; }
  .filters__meta { justify-self: end; }
}

/* Desktop */
@media (min-width: 1024px) {
  .filters {
    grid-template-columns: minmax(180px, 260px) auto auto;
    justify-content: end;
  }
}

.filters__field { position: relative; }

.filters__input {
  width: 100%;
  padding: .65rem 2.25rem .65rem .75rem;
  border: 1px solid #355b4c;
  border-radius: .75rem;
  font-size: .95rem;
  color: #FAC227;
  background-color: #355b4c;
}
.filters__input::placeholder,
.filters__input::-webkit-input-placeholder { color: #FAC227; opacity: 1; }
.filters__input[type="search"]::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; }

.filters__autocomplete {
  display: flex;
  justify-content: flex-start;
}

.filters__autocomplete {
  display: left;
  flex-direction: column;
  ul {
    list-style-type: none;
  }
}

/* Clear-Button */
.filters__clear {
  position: absolute;
  right: .5rem; top: 50%;
  transform: translateY(-50%);
  width: 1.5rem; height: 1.5rem;
  border-radius: 9999px;
  border: 1px solid transparent;
  background: transparent;
  color: #FAC227;
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
}
.filters__clear:hover { background: rgba(250, 194, 39, .15); }
.filters__clear:focus-visible { outline: 2px solid #FAC227; outline-offset: 2px; }

.filters__meta .filters__count { font-size: .85rem; opacity: .75; color: #355b4c; }
.filters__info { margin-top: .35rem; font-size: 1rem; opacity: .75; }

/* ---------- Autocomplete ---------- */
.filters__autocomplete {
  position: absolute;
  left: 0; right: 0;
  top: calc(100% + 4px);
  z-index: 30;
  background: #ffffff;
  color: #355b4c;
  border: 1px solid #355b4c;
  border-radius: .5rem;
  box-shadow: 0 8px 20px rgba(0,0,0,.12);
  max-height: 260px;
  overflow: auto;
  padding: .25rem 0;
}
.filters__opt {
  padding: .5rem .75rem;
  cursor: pointer;
  font-size: .95rem;
  line-height: 1.2;
}
.filters__opt:hover,
.filters__opt.is-active {
  background: #355b4c;
  color: #FAC227;
}

/* ---------- Slide / Card ---------- */
.slide-inner { position: relative; }

.short-description {
  position: relative;
  display: flex; flex-direction: column; align-items: center;
  background-color: #fac227;
  border-radius: 20px; width: 100%;
  padding-bottom: 15px;
}
.image-game {
  max-height: 318px; margin-bottom: 10px;
  border-radius: 20px 20px 0 0; width: 100%; object-fit: cover;
}
.short .game-infos img { transition: transform 0.5s ease-in-out; }
.short .game-infos img:hover { transform: rotate(360deg); }
.short .short-right .open-layer { width: 50px; height: auto; margin-right: 10px; }

/* Badge */
.card-badge {
  position: absolute; top: 1px; left: 1px;
  z-index: 6; background: #355b4c; color: #FAC227;
  border: 1px solid #355b4c; border-radius: 9999px;
  padding: .25rem .6rem; box-shadow: 0 2px 6px rgba(0,0,0,.15);
  pointer-events: none;
}
.card-badge__text { font-size: .85rem; font-weight: 600; letter-spacing: .2px; white-space: nowrap; }
@media (max-width: 380px) {
  .card-badge { padding: .2rem .5rem; }
  .card-badge__text { font-size: .8rem; }
}

/* ---------- Long description ---------- */
.long-description {
  position: absolute; bottom: -100%; left: 0; width: 100%;
  padding: 30px 20px 20px; background-color: #e9e2d0; color: #355b4c;
  border: 1px solid #355b4c; z-index: 5;
  transition: bottom 0.2s ease-in-out; height: 100%;
  border-radius: 20px;
}
.long-description-active { bottom: 0px; }
.long-description-content { display: flex; flex-direction: column; justify-content: space-between; height: inherit; }
.long-description .top-content { display: flex; justify-content: space-between; align-items: center; }
.long-description .close-btn { font-size: 30px; cursor: pointer; }
.long-description .game-information { display: flex; justify-content: stretch; }
.long-description .game-infos { display: flex; flex-direction: column; width: 100%; padding: 0 30px; }
.long-description .game-infos p { display: flex; justify-content: space-between; margin: 2px 0; }
.long-description .button { display: flex; justify-content: flex-end; }

/* Stärker gezielt: nur innerhalb des Age-Felds */
.filters__age .segmented {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid #355b4c;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.filters__age .segmented__btn {
  -webkit-appearance: none;
  appearance: none;
  border: 0;
  background: #E9E2D0;
  padding: .75rem .9rem;
  font-size: .9rem;
  line-height: 1;
  color: #355b4c;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;

  /* gegen globale .btn-Regeln absichern */
  text-transform: none;
  box-shadow: none;
  border-radius: 0;
}

.filters__age .segmented__btn + .segmented__btn {
  border-left: 1px solid rgba(53, 91, 76, 0.13);
}

.filters__age .segmented__btn.is-active {
  background: #355b4c;
  color: #FAC227;
}

.filters__age .segmented__btn:focus-visible {
  outline: 2px solid #FAC227;
  outline-offset: 2px;
}


</style>
