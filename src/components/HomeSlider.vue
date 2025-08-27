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
            v-model="plzQuery"
            @input="onPlzInput"
            type="search"
            class="filters__input"
            placeholder="PLZ (z. B. 10407)"
            inputmode="numeric"
            autocomplete="postal-code"
          />
          <button
            v-if="plzQuery"
            class="filters__clear"
            @click="plzQuery = ''"
            aria-label="PLZ löschen"
          >✕</button>
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

        <!-- Trefferzähler -->
        <div class="filters__meta">
          <span class="filters__count">{{ matchCount }} / {{ games.length }}</span>
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
    };
  },
  computed: {
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
    // --- UI ---
    onPlzInput(e) {
      // nur Ziffern, max 5 Zeichen
      const digits = (e.target.value || "").replace(/\D/g, "").slice(0, 5);
      this.plzQuery = digits;
    },
    getGameImagePath(imagePath) {
      try {
        return new URL(imagePath, import.meta.url).href;
      } catch {
        return imagePath; // falls bereits absolute URL
      }
    },
    toggleLayer(index) {
      this.activeIndex = this.activeIndex === index ? null : index;
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

    // --- PLZ-Helfer ---
    // Für die Anzeige (Badge): bevorzuge „schöne“ 5-stellige PLZ, wenn vorhanden
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
    // Für das Filtern: normalisiert (nur Ziffern, ohne führende Nullen)
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
    // erste 4–5-stellige Ziffernfolge finden (DE i. d. R. 5)
    extractPlz(text = "") {
      const m = String(text).match(/\b\d{4,5}\b/);
      return m ? m[0] : "";
    },
    // "01067" -> "1067", nur Ziffern
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

.slider-below-title {
    width: 95%;
}

/* Mobile: untereinander */
@media (max-width: 1023.98px) {
  .filters { grid-template-columns: 1fr; }
  .filters__meta { justify-self: end; }
}

/* Desktop: kompakt rechtsbündig in einer Zeile */
@media (min-width: 1024px) {
  .filters {
    grid-template-columns: minmax(180px, 260px) auto auto;
    justify-content: end;
  }
}

.filters__field { position: relative; }

.filters__input {
  width: 100%;
  padding: .65rem 2.25rem .65rem .75rem; /* Platz für Clear-Button */
  border: 1px solid #355b4c;
  border-radius: .75rem;
  font-size: .95rem;
  color: #FAC227;
  background-color: #355b4c;
}
.filters__input::placeholder,
.filters__input::-webkit-input-placeholder {
  color: #FAC227;
  opacity: 1;
}
/* natives Browser-X ausblenden */
.filters__input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
}
/* eigenes X */
.filters__clear {
  position: absolute;
  right: .5rem;
  top: 50%;
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

.filters__meta .filters__count {
  font-size: .85rem;
  opacity: .75;
}
.filters__info {
  margin-top: .35rem;
  font-size: .85rem;
  opacity: .75;
}

/* ---------- Segmented (Age) ---------- */
.segmented {
  display: inline-flex;
  border: 1px solid #355b4c;
  border-radius: 999px;
  overflow: hidden;
  background: #fff;
}
.segmented__btn {
  padding: .4rem .8rem;
  font-size: .9rem;
  line-height: 1;
  border: none;
  background: transparent;
  color: #355b4c;
  cursor: pointer;
}
.segmented__btn + .segmented__btn { border-left: 1px solid #355b4c22; }
.segmented__btn.is-active { background: #355b4c; color: #FAC227; }
.segmented__btn:focus-visible { outline: 2px solid #FAC227; outline-offset: 2px; }

/* ---------- Slide / Card ---------- */
.slide-inner { position: relative; }

.short-description {
  position: relative;       /* für Badge */
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fac227;
  border-radius: 20px;
  width: 100%;
  padding-bottom: 15px;
}
.image-game {
  max-height: 318px;
  margin-bottom: 10px;
  border-radius: 20px 20px 0 0;
  width: 100%;
  object-fit: cover;
}
.short .game-infos img { transition: transform 0.5s ease-in-out; }
.short .game-infos img:hover { transform: rotate(360deg); }
.short .short-right .open-layer { width: 50px; height: auto; margin-right: 10px; }

/* Badge */
.card-badge {
  position: absolute;
  top: 10px; right: 10px;
  z-index: 6;
  background: #355b4c;
  color: #FAC227;
  border: 1px solid #355b4c;
  border-radius: 9999px;
  padding: .25rem .6rem;
  box-shadow: 0 2px 6px rgba(0,0,0,.15);
  pointer-events: none;
}
.card-badge__text {
  font-size: .85rem;
  font-weight: 600;
  letter-spacing: .2px;
  white-space: nowrap;
}
@media (max-width: 380px) {
  .card-badge { padding: .2rem .5rem; }
  .card-badge__text { font-size: .8rem; }
}

/* ---------- Long description ---------- */
.long-description {
  position: absolute;
  bottom: -100%;
  left: 0; width: 100%;
  padding: 20px;
  background-color: #e9e2d0; color: #355b4c;
  border: 1px solid #355b4c;
  z-index: 5;
  transition: bottom 0.2s ease-in-out;
  height: 100%;
  border-radius: 20px;
}
.long-description-active { bottom: 0px; }
.long-description-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: inherit;
}
.long-description .top-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.long-description .close-btn { font-size: 30px; cursor: pointer; }
.long-description .game-information { display: flex; justify-content: stretch; }
.long-description .game-infos {
  display: flex; flex-direction: column; width: 100%; padding: 0 30px;
}
.long-description .game-infos p {
  display: flex; justify-content: space-between; margin: 2px 0;
}
.long-description .button { display: flex; justify-content: flex-end; }
</style>
