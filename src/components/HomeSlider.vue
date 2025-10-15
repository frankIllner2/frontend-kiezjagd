<template>
  <BaseSlider
    title="Wähle dein Spiel!"
    :items="filteredGames"
    sliderId="game-preview-section"
    containerClass="container game-preview-section"
  >
    <!-- 🎯 Filter direkt unter dem H2 -->
    <template #below-title>
      <div class="filters" role="region" aria-labelledby="filters-legend">
        <h3 id="filters-legend" class="sr-only">Spiele filtern</h3>

        <!-- PLZ -->
        <div class="filters__field filters__plz">
          <label for="filter-plz"></label>
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
            placeholder="Suche nach PLZ"
            inputmode="numeric"
            autocomplete="postal-code"
            role="combobox"
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
            aria-label="PLZ Eingabe löschen"
            type="button"
          >✕</button>

          <!-- 🔽 Autocomplete Dropdown -->
          <ul
            v-if="showPlzMenu && plzSuggestions.length"
            id="plz-listbox"
            class="filters__autocomplete"
            role="listbox"
            :aria-label="`Vorschläge für PLZ ${plzQuery}`"
          >
            <li
              v-for="(s, i) in plzSuggestions"
              :key="s"
              :id="`plz-opt-${i}`"
              role="option"
              :aria-selected="i === plzActiveIndex ? 'true' : 'false'"
              :class="['filters__opt', { 'is-active': i === plzActiveIndex }]"
              @mousedown.prevent="applyPlzSuggestion(s)"
              @mousemove="plzActiveIndex = i"
            >
              {{ s }}
            </li>
          </ul>
        </div>

        <!-- Altersgruppe: als echte Radios in Fieldset -->
        <fieldset class="filters__field filters__age">
          <legend class="sr-only">Altersgruppe filtern</legend>
          <div class="segmented" role="radiogroup" aria-label="Altersgruppe">
            <label class="segmented__label">
              <input
                class="segmented__radio"
                type="radio"
                name="age"
                value="Alle"
                :checked="selectedAge === 'Alle'"
                @change="selectedAge = 'Alle'"
              />
              <span class="segmented__btn" :class="{ 'is-active': selectedAge === 'Alle' }">Alle</span>
            </label>
            <label class="segmented__label">
              <input class="segmented__radio" type="radio" name="age" value="Mini" :checked="selectedAge === 'Mini'" @change="selectedAge = 'Mini'" />
              <span class="segmented__btn" :class="{ 'is-active': selectedAge === 'Mini' }">Mini</span>
            </label>
            <label class="segmented__label">
              <input class="segmented__radio" type="radio" name="age" value="Medi" :checked="selectedAge === 'Medi'" @change="selectedAge = 'Medi'" />
              <span class="segmented__btn" :class="{ 'is-active': selectedAge === 'Medi' }">Medi</span>
            </label>
            <label class="segmented__label">
              <input class="segmented__radio" type="radio" name="age" value="Maxi" :checked="selectedAge === 'Maxi'" @change="selectedAge = 'Maxi'" />
              <span class="segmented__btn" :class="{ 'is-active': selectedAge === 'Maxi' }">Maxi</span>
            </label>
          </div>
        </fieldset>

        <!-- Live-Status für Trefferanzahl -->
        <p class="filters__meta" role="status" aria-live="polite">
          <span class="filters__count">{{ matchText }}</span>
        </p>
      </div>

      <!-- Hinweis bei 0 Treffern (es werden alle gezeigt) -->
      <p v-if="(plzQuery || selectedAge !== 'Alle') && rawFiltered.length === 0" class="filters__info" role="status" aria-live="polite">
        Keine Treffer – zeige alle Spiele.
      </p>
    </template>

    <!-- Cards / jeder Slide hat EINEN Root-Wrapper -->
    <template #default="{ item, index }">
      <div class="slide-inner">
        <article class="short-description" :aria-labelledby="`game-title-${index}`">
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
            <h3 :id="`game-title-${index}`">{{ item.name }}</h3>
              <b>Start: {{ item.startloction }}</b>
          </div>

          <div class="short">
            <div class="short-left">
            
              <b>{{ formatAge(item.ageGroup) }}</b>
            </div>

            <!-- Info/Details öffnen (getrackt) -->
            <div class="game-infos">
              
              <button
                class="open-layer-btn"
                type="button"
                :aria-expanded="activeIndex === index ? 'true' : 'false'"
                :aria-controls="`desc-${index}`"
                @click="onInfo(item, index)"
              >
                <img src="@/assets/img/icons/open-plus.png" alt="Details anzeigen" class="open-layer" />
              </button>
            </div>

            <div class="short-right">
              <div class="button">
                <button
                  class="btn btn--fourth"
                  type="button"
                  @click="onBuy(item, 'card', index)"
                >
                  Kaufen
                </button>
              </div>
            </div>
          </div>
        </article>

        <!-- Long-description -->
        <section
          class="long-description"
          :class="{ 'long-description-active': activeIndex === index }"
          :id="`desc-${index}`"
          role="region"
          :aria-labelledby="`desc-title-${index}`"
          @keydown.esc.prevent="closeLayer()"
        >
          <div class="long-description-content">
            <div class="top-content">
              <div class="top-info">
                <b :id="`desc-title-${index}`">{{ item.name }}</b>
              </div>
              <div class="close-btn">
                <button type="button" class="icon-only" @click="closeLayer" aria-label="Details schließen">
                  <font-awesome-icon icon="minus-circle" class="close-icon-2" />
                </button>
              </div>
            </div>
            <div class="game-information">
              <div class="game-infos">
                <p>
                  <span>Schwierigkeit:</span>
                  <span>{{ formatAge(item.ageGroup) }}</span>
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
                type="button"
                @click="onBuy(item, 'details', index)"
              >
                Kaufen
              </button>
            </div>
          </div>
        </section>
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
      // Autocomplete State
      showPlzMenu: false,
      plzActiveIndex: -1,
    };
  },
  computed: {
    matchText() {
      const hasFilter = !!this.plzQuery || this.selectedAge !== 'Alle';
      const n = hasFilter ? this.rawFiltered.length : this.games.length;
      return n === 1 ? '1 Spiel gefunden' : (n + ' Spiele gefunden');
    },

    // alle verfügbaren PLZs (einmalig aus den Games extrahiert)
    plzCandidates() {
      const set = new Set();
      const src = Array.isArray(this.games) ? this.games : [];
      for (let i = 0; i < src.length; i++) {
        const g = src[i] || {};
        const a = this.extractPlz(String(g.plz || ""));
        const b = this.extractPlz(String(g.startloction || ""));
        const c = this.extractPlz(String(g.endloction || ""));
        const d = this.extractPlz(String(g.city || ""));
        if (a) set.add(a);
        if (b) set.add(b);
        if (c) set.add(c);
        if (d) set.add(d);
      }
      // sortiert aufsteigend numerisch (Fallback: string)
      return Array.from(set).sort(function (x, y) {
        const nx = parseInt(x, 10); const ny = parseInt(y, 10);
        if (isNaN(nx) || isNaN(ny)) return String(x).localeCompare(String(y));
        return nx - ny;
      });
    },

    // Vorschläge ab der 2. Ziffer, Prefix-Match
    plzSuggestions() {
      const q = this.normalizePlz(this.plzQuery);
      if (q.length < 2) return [];
      const out = [];
      const list = this.plzCandidates;
      for (let i = 0; i < list.length; i++) {
        const s = list[i];
        if (this.normalizePlz(s).startsWith(q)) out.push(s);
        if (out.length >= 8) break; // max 8 Vorschläge
      }
      return out;
    },

    // echtes Filterergebnis (kann 0 sein) – inkl. Sortierung
    rawFiltered() {
      let list = Array.isArray(this.games) ? this.games.slice() : [];

      // PLZ: normalisieren & Prefix-Match über mehrere Felder
      const qDigits = this.normalizePlz(this.plzQuery);
      if (qDigits) {
        list = list.filter((g) => this.getGamePlz(g).startsWith(qDigits));
      }

      // Altersgruppe
      if (this.selectedAge !== "Alle") {
        const age = String(this.selectedAge).toLowerCase();
        list = list.filter((g) => String((g && g.ageGroup) || "").toLowerCase() === age);
      }

      // 🔥 Sortierung: sortIndex (aufsteigend), dann Name
      const toNum = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 9999;
      };
      list.sort((a, b) => {
        const sa = toNum(a && a.sortIndex);
        const sb = toNum(b && b.sortIndex);
        if (sa !== sb) return sa - sb;
        const an = (a && a.name) ? String(a.name) : '';
        const bn = (b && b.name) ? String(b.name) : '';
        return an.localeCompare(bn, 'de');
      });

      return list;
    },

    // Fallback: bei 0 Treffern alle Spiele anzeigen – ebenfalls sortiert
    filteredGames() {
      const hasFilter = !!this.plzQuery || this.selectedAge !== "Alle";
      if (hasFilter && this.rawFiltered.length === 0) {
        const toNum = (v) => {
          const n = Number(v);
          return Number.isFinite(n) ? n : 9999;
        };
        return (Array.isArray(this.games) ? this.games.slice() : []).sort((a, b) => {
          const sa = toNum(a && a.sortIndex);
          const sb = toNum(b && b.sortIndex);
          if (sa !== sb) return sa - sb;
          const an = (a && a.name) ? String(a.name) : '';
          const bn = (b && b.name) ? String(b.name) : '';
          return an.localeCompare(bn, 'de');
        });
      }
      return this.rawFiltered;
    },
  },

  methods: {
    /* =========================
     * Autocomplete UI
     * ========================= */
    onPlzInput(e) {
      const inputVal = e && e.target ? e.target.value : "";
      const digits = String(inputVal || "").replace(/\D/g, "").slice(0, 5);
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
      const self = this;
      setTimeout(function () {
        self.showPlzMenu = false;
        self.plzActiveIndex = -1;
      }, 120);
    },
    onPlzKeydown(e) {
      if (!this.showPlzMenu && !(e && e.key === 'ArrowDown' && this.plzSuggestions.length)) return;

      const key = e ? e.key : '';
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === 'Escape' || key === 'Home' || key === 'End') {
        e.preventDefault();
      }

      const last = this.plzSuggestions.length - 1;
      if (key === 'ArrowDown') {
        this.showPlzMenu = true;
        this.plzActiveIndex = this.plzActiveIndex < last ? this.plzActiveIndex + 1 : 0;
      } else if (key === 'ArrowUp') {
        this.plzActiveIndex = this.plzActiveIndex > 0 ? this.plzActiveIndex - 1 : last;
      } else if (key === 'Home') {
        this.plzActiveIndex = 0;
      } else if (key === 'End') {
        this.plzActiveIndex = last;
      } else if (key === 'Enter') {
        if (this.plzActiveIndex >= 0) this.applyPlzSuggestion(this.plzSuggestions[this.plzActiveIndex]);
        this.showPlzMenu = false;
      } else if (key === 'Escape') {
        this.showPlzMenu = false;
        this.plzActiveIndex = -1;
      }
    },
    applyPlzSuggestion(s) {
      this.plzQuery = this.normalizePlz(s).slice(0, 5); // übernehmen (nur Ziffern)
      this.showPlzMenu = false;
      this.plzActiveIndex = -1;
      if (this.$refs && this.$refs.plzInput && typeof this.$refs.plzInput.focus === 'function') {
        this.$refs.plzInput.focus();
      }
    },
    clearPlz() {
      this.plzQuery = "";
      this.showPlzMenu = false;
      this.plzActiveIndex = -1;
      if (this.$refs && this.$refs.plzInput && typeof this.$refs.plzInput.focus === 'function') {
        this.$refs.plzInput.focus();
      }
    },

    /* =========================
     * UI / Sonstiges
     * ========================= */
    getGameImagePath(imagePath) {
      // konservativ: einfach zurückgeben (keine optional chaining / import.meta)
      return imagePath || "";
    },
    toggleLayer(index) {
      this.activeIndex = (this.activeIndex === index) ? null : index;
    },
    closeLayer() {
      this.activeIndex = null;
    },
    formatAge(age) {
      const a = String(age || "").toLowerCase();
      if (a === "mini") return "Mini";
      if (a === "medi") return "Medi";
      if (a === "maxi") return "Maxi";
      return age || "";
    },

    /* =========================
     * Tracking-Helpers
     * ========================= */
    slugify(str) {
      if (!str) return null;
      return String(str)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')       // spaces -> dash
        .replace(/[^\w-]+/g, '')    // remove non-word
        .replace(/--+/g, '-')       // collapse dashes
        .replace(/^-+|-+$/g, '');   // trim dashes
    },
    getGameId(item) {
      if (!item || typeof item !== 'object') return null;
      if (item.encryptedId) return String(item.encryptedId);
      if (item._id)         return String(item._id);
      if (item.id)          return String(item.id);
      if (item.slug)        return String(item.slug);
      if (item.name)        return this.slugify(item.name); // Fallback
      return null;
    },
    normalizePrice(val) {
      if (val === undefined || val === null) return null;
      // akzeptiert: 29.9 | "29,90 €" | "29.90EUR"
      var s = String(val)
        .replace(/\s+/g, '')
        .replace(/€|eur/gi, '')
        .replace(',', '.')
        .replace(/[^0-9.]/g, '');
      var num = parseFloat(s);
      return isFinite(num) ? num : null;
    },

    /* =========================
     * Tracking: INFO (Details öffnen)
     * ========================= */
    onInfo(item, index) {
      var willOpen = this.activeIndex !== index; // nur Öffnen tracken
      if (willOpen) this.trackInfoOpen(item, index);
      this.toggleLayer(index);
    },
    trackInfoOpen(item, index) {
      try {
        var gameId   = this.getGameId(item);
        var gameName = item && item.name ? String(item.name) : null;
        var ageGroup = item && item.ageGroup ? String(item.ageGroup).toLowerCase() : null;
        var plz      = this.getGamePlzDisplay(item) || null;

        var props = {
          gameId: gameId,
          gameName: gameName,
          ageGroup: ageGroup,
          plz: plz,
          index: (typeof index === 'number') ? index : null
        };

        if (typeof window !== 'undefined' && window && typeof window.plausible === 'function') {
          window.plausible('info_click', { props: props });
        }
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') console.warn('[analytics] info_click failed', e);
      }
    },

    /* =========================
     * Tracking: KAUFEN (CTA)
     * ========================= */
    onBuy(item, placement, index) {
      this.trackBuy(item, placement, index);
      // ursprüngliches Verhalten beibehalten:
      this.$emit('open-modal', item);
    },
    trackBuy(item, placement, index) {
      try {
        var gameId   = this.getGameId(item);
        var gameName = item && item.name ? String(item.name) : null;
        var ageGroup = item && item.ageGroup ? String(item.ageGroup).toLowerCase() : null;
        var plz      = this.getGamePlzDisplay(item) || null;
        var price    = this.normalizePrice(item && item.price !== undefined ? item.price : null);

        var props = {
          gameId: gameId,
          gameName: gameName,
          ageGroup: ageGroup,
          plz: plz,
          placement: placement, // 'card' | 'details'
          index: (typeof index === 'number') ? index : null,
          price: price
        };

        if (typeof window !== 'undefined' && window && typeof window.plausible === 'function') {
          window.plausible('buy_click', { props: props });
        }
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') console.warn('[analytics] buy_click failed', e);
      }
    },

    /* =========================
     * PLZ-Helper
     * ========================= */
    // 1) Robustere Extraktion: findet 5 Ziffern auch ohne Wortgrenzen
    extractPlz(text) {
      const m = String(text || "").match(/\d{5}/); // bewusst ohne \b
      return m ? m[0] : "";
    },

    // 2) Normalisierung belassen (für Prefix-Vergleich)
    normalizePlz(val) {
      return String(val || "").replace(/\D/g, "").replace(/^0+/, "");
    },

    // 3) Anzeige: bevorzugt g.plz, sonst aus anderen Feldern ziehen
    getGamePlzDisplay(g) {
      g = g || {};
      // schnellster Weg: wenn g.plz bereits 5 Ziffern enthält
      const direct = this.extractPlz(g.plz);
      if (direct) return direct;

      // Fallbacks (alte Felder bleiben für Sicherheit drin)
      const candidates = [
        g.startloction, g.endloction, g.city
      ];
      for (let i = 0; i < candidates.length; i++) {
        const found = this.extractPlz(candidates[i]);
        if (found) return found;
      }
      return "";
    },

    // 4) Vergleichswert für das eigentliche Filter (nur Ziffern)
    getGamePlz(g) {
      const display = this.getGamePlzDisplay(g);
      return display ? this.normalizePlz(display) : "";
    },

  },
};
</script>

<style scoped>
/* ---------- A11y Utilities ---------- */
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* ---------- Filterbar ---------- */
.filters {
  display: grid;
  gap: .5rem .75rem;
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

.filters__field { position: relative; border: none; }

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

/* ---------- Segmented (Radios) ---------- */
.filters__age fieldset { border: 0; padding: 0; margin: 0; }
.segmented {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid #355b4c;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}
.segmented__label { position: relative; display: inline-flex; }
.segmented__radio { position: absolute; inset: 0; opacity: 0; pointer-events: none; }
.segmented__btn {
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
  text-transform: none;
  box-shadow: none;
  border-radius: 0;
}
.segmented__label + .segmented__label .segmented__btn { border-left: 1px solid rgba(53, 91, 76, 0.13); }
.segmented__btn.is-active { background: #355b4c; color: #FAC227; }
.segmented__label:focus-within .segmented__btn { outline: 2px solid #FAC227; outline-offset: 2px; }

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

.open-layer-btn { background: transparent; border: 0; padding: 0 .25rem; cursor: pointer; }
.open-layer-btn:focus-visible { outline: 2px solid #355b4c; outline-offset: 2px; }

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
.long-description .close-btn .icon-only { font-size: 30px; cursor: pointer; background: transparent; border: 0; }
.long-description .close-btn .icon-only svg { color: #355b4c; }
.long-description .game-information { display: flex; justify-content: stretch; }
.long-description .game-infos { display: flex; flex-direction: column; width: 100%; padding: 0 30px; }
.long-description .game-infos p { display: flex; justify-content: space-between; margin: 2px 0; }
.long-description .button { display: flex; justify-content: flex-end; }

</style>
