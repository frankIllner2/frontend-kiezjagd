<template>
  <div class="home-container">
    <!-- Skiplink für Tastaturnutzer -->
    <a class="skip-link" href="#main-content">Zum Inhalt springen</a>

    <HeaderMenu />

    <main id="main-content" tabindex="-1">
      <!-- Hero Section -->
      <section class="container top-header" role="region" aria-labelledby="hero-heading">
        <div>
          <div class="headline-container">
            <h1 id="hero-heading">Interaktive Abenteuer für deinen Kiez</h1>
            <div class="buttons">
              <button
                @click="scrollToSection('game-preview-section')"
                class="btn btn--primary"
                aria-controls="game-preview-section"
              >
                Spiele entdecken
              </button>
              <button
                @click="scrollToSection('what-is-section')"
                class="btn btn--third"
                aria-controls="what-is-section"
              >
                Was ist Kiezjagd?
              </button>
            </div>
          </div>

          <!-- AgeGroup -->
          <section role="region" aria-labelledby="agegroup-heading">
            <h2 id="agegroup-heading" class="sr-only">Spiele nach Altersgruppen</h2>
            <HomeSlider3 :games="games" />
          </section>
        </div>
      </section>

      <!-- Headline Info Text -->
      <section id="what-is-headline" class="container what-is-headline" role="region" aria-labelledby="what-is-headline-h2">
        <h2 id="what-is-headline-h2" class="sr-only">Warum Kiezjagd besonders ist</h2>
        <div class="headline font-bold">
          <img class="inline-img" src="@/assets/img/icons/game-group.png" alt="Kindergruppe-Icon" />
          Entdecke dein Viertel neu: Löse knifflige Rätsel, finde versteckte Hinweise und
          meistere spannende Herausforderungen. Ob alleine oder mit deinem Team – erlebe
          bekannte Orte aus völlig neuen Blickwinkeln!
        </div>
      </section>

      <!-- Einführungstext -->
      <section id="what-is-section" class="container what-is-section" role="region" aria-labelledby="what-is-heading">
        <div class="wapper">
          <h2 id="what-is-heading">Was ist Kiezjagd?</h2>
          <div class="grid container cards" role="list">
            <!-- Card 1 -->
            <article class="card" role="listitem">
              <div class="icon">
                <img src="@/assets/img/icons/fritz.png" alt="Fritz – dein digitaler Spielleiter" />
              </div>
              <div class="info">
                <h3>Dein Smartphone als Spielleiter</h3>
                <p>
                  Mit deinem Smartphone begibst du dich auf eine Reise voller Überraschungen und Spaß.
                  Während du online knifflige Rätsel löst, versteckte Hinweise findest und 
                  spannende Herausforderungen meisterst, entdeckst du vertraute Orte aus völlig neuen Perspektiven.
                </p>
              </div>
            </article>

            <!-- Card 2 -->
            <article class="card" role="listitem">
              <div class="icon">
                <img src="@/assets/img/icons/frida.png" alt="Frida – deine Abenteuerbegleiterin" />
              </div>
              <div class="info">
                <h3>Dein interaktives Abenteuer</h3>
                <p>
                  Kiezjagd ist mehr als nur ein Spiel – es ist ein interaktives Abenteuer, 
                  das dich direkt in deinem Viertel herausfordert! Egal ob du allein, mit Freunden oder 
                  deiner Familie unterwegs bist, jede Frage führt dich zu interessanten Plätzen, die du vielleicht noch nie bemerkt hast.
                </p>
              </div>
            </article>
          </div>
          <div class="button">
            <button
              @click="scrollToSection('game-preview-section')"
              class="btn btn--fourth"
              aria-controls="game-preview-section"
            >
              Spiele entdecken
            </button>
          </div>
        </div>
      </section>

      <!-- Beliebte Spiele -->
      <HomeSlider :games="games" @open-modal="openModal" />

      <!-- Modal Fenster -->
      <div v-if="showModal" class="modal-overlay" @keydown.esc="closeModal">
        <div
          class="modal"
          ref="modalEl"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="modalTitleId"
          :aria-describedby="modalDescId"
          @keydown.tab.prevent="trapFocus"
        >
          <h2 :id="modalTitleId">Spiel kaufen: {{ currentGame?.name }}</h2>
          <p :id="modalDescId">
            Um dir den Spiel-Link nach dem Kauf zusenden zu können, benötigen wir deine E-Mail-Adresse.
          </p>

          <form @submit.prevent="handleCheckout" novalidate>
            <div class="form-row">
              <label :for="emailId">E‑Mail<span aria-hidden="true"></span></label>
              <input
                :id="emailId"
                type="email"
                placeholder="E-Mail Adresse"
                v-model="userEmail"
                required
                inputmode="email"
                autocomplete="email"
                :aria-invalid="emailInvalid ? 'true' : 'false'"
                :aria-describedby="emailHelpId + ' ' + (checkoutError ? errorId : '')"
                ref="emailInput"
              />
              <p class="form-hint sr-only" :id="emailHelpId">Gib eine gültige E‑Mail‑Adresse ein, um den Link zu erhalten.</p>
            </div>

            <div class="form-row" v-if="currentGame?.isVoucher">
              <label :for="voucherId">Gutscheincode (optional)</label>
              <input
                :id="voucherId"
                type="text"
                v-model="voucherCode"
                autocomplete="one-time-code"
              />
            </div>

            <!-- Fehlerhinweis -->
            <p
              v-if="checkoutError"
              class="mt-2 p-2 error-text"
              :id="errorId"
              role="alert"
              aria-live="assertive"
            >
              {{ checkoutError }}
            </p>

            <div class="modal-actions">
              <button class="btn btn--third" type="button" @click="closeModal" :disabled="isCheckingOut">Abbrechen</button>
              <button
                class="btn btn--primary"
                type="submit"
                :disabled="isCheckingOut"
                :aria-busy="isCheckingOut ? 'true' : 'false'"
              >
                {{ isCheckingOut ? 'Wird geprüft…' : 'Kaufen' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Vorteile als Cards -->
      <section id="features-section" class="container features-section" role="region" aria-labelledby="features-heading">
        <h2 id="features-heading">Warum Kiezjagd?</h2>
        <p>
          Kiezjagd ist mehr als nur ein Spiel – es ist ein interaktives Abenteuer dein
          Viertel zu entdecken.
        </p>

        <!-- 🚀 Desktop-Version (wird NUR über 600px angezeigt) -->
        <div class="grid container" v-if="!isMobile" role="list">
          <div class="info" v-for="(feature, index) in features" :key="index" role="listitem">
            <div class="icon">
              <img :src="feature.image" :alt="'Feature: ' + feature.title" />
            </div>
            <div>
              <b>{{ feature.title }}</b><br />
              <span>{{ feature.text }}</span>
            </div>
          </div>
        </div>

        <!-- 📱 Mobile-Version: Zeigt den Slider NUR unter 600px -->
        <HomeSlider4 v-if="isMobile && features.length > 0" :features="features" />
      </section>

      <!-- Top Teams Ranking -->
      <HomeSlider2 :rankings="randomRankings" />

      <!-- Call-to-Action -->
      <section class="container community-section" role="region" aria-labelledby="cta-heading">
        <div class="icons-header" aria-hidden="true">
          <img src="@/assets/img/icons/fritz.png" alt="" />
          <img src="@/assets/img/icons/susi.png" alt="" />
          <img src="@/assets/img/icons/julia.png" alt="" />
          <img src="@/assets/img/icons/frank.png" alt="" />
        </div>
        <h2 id="cta-heading">Bereit für dein Abenteuer?</h2>
        <div class="container">
          <p>Melde dich jetzt an und werde Teil der Kiezjagd-Community</p>

          <button class="btn btn--third" @click="showNewsletterForm = true" aria-label="Newsletter anmelden">
            Newsletter abonnieren
          </button>
        </div>
        <div class="bottom-menu">
          <div class="left">
            <a href="/Impressum" target="_blank" rel="noopener">Impressum</a>
            <a href="/Agb" target="_blank" rel="noopener">AGB/Datenschutz</a>
          </div>

          <div class="right">
            <span>© 2025 Kiezjagd</span>
          </div>
        </div>
      </section>
    </main>

    <NewsletterSignup :visible="showNewsletterForm" @close="showNewsletterForm = false" />
  </div>
</template>

<script>
import { nextTick } from 'vue'
import { apiService } from "@/services/apiService";
import HomeSlider from "@/components/HomeSlider.vue";
import HeaderMenu from "@/components/HeaderMenu.vue";
import HomeSlider2 from "@/components/HomeSlider2.vue";
import HomeSlider3 from "@/components/HomeSlider3.vue";
import HomeSlider4 from "@/components/HomeSlider4.vue";
import fritz from "@/assets/img/icons/fritz.png";
import susi from "@/assets/img/icons/susi.png";
import frida from "@/assets/img/icons/frida.png";
import frank from "@/assets/img/icons/frank.png";
import NewsletterSignup from "@/components/NewsletterSignup.vue";

export default {
  name: "HomePage",
  components: {
    HomeSlider,
    HeaderMenu,
    HomeSlider2,
    HomeSlider3,
    HomeSlider4,
    NewsletterSignup,
  },
  data() {
    return {
      isMobile: typeof window !== 'undefined' ? window.innerWidth <= 600 : false,
      topTeams: [],
      games: [],
      randomRankings: [],
      userEmail: "",
      showModal: false,
      currentGameId: null,
      showInstruction1: false,
      showInstruction2: false,
      showInstruction3: false,
      showNewsletterForm: false,
      voucherCode: "",
      currentGame: null,
      isCheckingOut: false,
      checkoutError: "",
      lastFocusedEl: null,
      // IDs für ARIA-Verknüpfungen
      modalTitleId: 'buy-title',
      modalDescId: 'buy-desc',
      emailId: 'email-input',
      emailHelpId: 'email-help',
      voucherId: 'voucher-input',
      errorId: 'payment-error',
      features: [
        {
          title: "Um die Ecke",
          text: "Spannende Fragen direkt aus deiner Umgebung für Minis, Medis, Maxis.",
          image: fritz,
        },
        {
          title: "Immer griffbereit",
          text: "Spiele bequem auf deinem Smartphone oder Tablet.",
          image: frank,
        },
        {
          title: "Gemeinsam spielen",
          text: "Teile dein Abenteuer mit Freunden und Familie.",
          image: frida,
        },
        {
          title: "Werde KiezMeister",
          text: "Lasse dein Spielergebnis strahlen: verewige dich in unserer “Mitgemacht”- Liste!.",
          image: susi,
        },
      ],
    };
  },
  computed: {
    emailInvalid() {
      if (!this.userEmail) return false
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return !emailRegex.test(this.userEmail.trim())
    },
  },
  methods: {
    checkScreenSize() {
      if (typeof window !== 'undefined') {
        this.isMobile = window.innerWidth <= 600;
      }
    },
    getImagePath(imagePath) {
      return new URL(imagePath, import.meta.url).href;
    },
    scrollToSection(id) {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        target.setAttribute('tabindex', '-1')
        target.focus({ preventScroll: true })
      }
    },
    async fetchGames() {
      try {
        const games = await apiService.fetchGames();
        this.games = games.filter((game) => !game.isDisabled);
      } catch (error) {
        console.error("Fehler beim Laden der Spiele:", error);
      }
    },
    async handleCheckout() {
      this.checkoutError = '';
      this.isCheckingOut = true;
      try {
        const email = this.userEmail?.trim();
        const code = this.voucherCode?.trim() || null;

        if (!email) {
          this.checkoutError = "Eine E-Mail-Adresse ist erforderlich.";
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          this.checkoutError = "Bitte gib eine gültige E-Mail-Adresse ein.";
          return;
        }
        if (!this.currentGameId) {
          this.checkoutError = "Keine Spiel-ID gefunden.";
          return;
        }

        const { url } = await apiService.createCheckoutSession(
          this.currentGameId,
          email,
          code
        );
        window.location.href = url;
      } catch (error) {
        console.error("❌ Fehler beim Checkout:", error);
        const payload = error?.response?.data || {};
        const code = payload.code;
        const msg = payload.error || error?.message || "Checkout fehlgeschlagen.";

        if (code === "PROMO_CODE_INVALID") {
          this.checkoutError = "Dieser Gutscheincode ist abgelaufen oder ungültig.";
          this.voucherCode = "";
          try {
            localStorage.removeItem("kiezjagd_voucher");
          } catch (e) {
            console.warn("Voucher konnte nicht entfernt werden:", e);
          }
        } else {
          this.checkoutError = msg;
        }
      } finally {
        this.isCheckingOut = false;
        // Fehler sofort ansagen
        await nextTick()
        const err = document.getElementById(this.errorId)
        if (err) err.focus({ preventScroll: true })
      }
    },
    openModal(game) {
      if (!game || game.isDisabled) {
        alert("Dieses Spiel ist derzeit nicht verfügbar.");
        return;
      }
      this.currentGameId = game.encryptedId;
      this.currentGame = game;
      this.lastFocusedEl = document.activeElement;
      this.showModal = true;
      this.checkoutError = ""; // Reset Meldung beim Öffnen
      this.$nextTick(() => {
        const input = this.$refs.emailInput
        if (input && input.focus) input.focus()
      })
      // Scroll sperren
      document.documentElement.style.overflow = 'hidden'
    },
    closeModal() {
      this.showModal = false;
      this.userEmail = "";
      this.currentGameId = null;
      this.checkoutError = "";
      this.isCheckingOut = false;
      // Scroll wieder erlauben
      document.documentElement.style.overflow = ''
      // Fokus zurückgeben
      if (this.lastFocusedEl && this.lastFocusedEl.focus) {
        this.lastFocusedEl.focus()
      }
    },
    async fetchRandomGameRankings() {
      try {
        // ✅ Zufällige Spiele abrufen
        let randomGameIds = await apiService.getRandomGames();

        // 🛑 Deaktivierte Spiele herausfiltern
        const allGames = await apiService.fetchGames();
        const activeGameIds = allGames
          .filter((game) => !game.isDisabled) // 🛑 Nur aktive Spiele
          .map((game) => game.encryptedId);

        // Entferne zufällige Spiele, die deaktiviert sind
        randomGameIds = randomGameIds.filter((id) => activeGameIds.includes(id));

        if (!randomGameIds || randomGameIds.length === 0) {
          console.warn("⚠️ Keine zufälligen Spiele gefunden");
          return;
        }

        // ✅ Top-5-Ergebnisse für jedes zufällige Spiel abrufen
        const rankings = await Promise.all(
          randomGameIds.map(async (id) => {
            try {
              return await apiService.getTop5Results(id);
            } catch (error) {
              console.error(`❌ Fehler beim Abrufen von Top 5 für Spiel ${id}:`, error);
              return null;
            }
          })
        );

        // ✅ Daten filtern, falls einzelne Abfragen fehlschlagen
        this.randomRankings = rankings
          .filter((ranking) => ranking !== null)
          .map((ranking, index) => ({
            gameId: randomGameIds[index],
            gameName: ranking.gameName,
            topResults: ranking.topResults,
          }));
      } catch (error) {
        console.error("❌ Fehler beim Laden zufälliger Rankings:", error);
      }
    },
    trapFocus(e) {
      const modal = this.$refs.modalEl
      if (!modal) return
      const focusable = modal.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const isShift = e.shiftKey
      const active = document.activeElement

      if (!isShift && active === last) {
        first.focus()
      } else if (isShift && active === first) {
        last.focus()
      }
    },
  },
  beforeUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener("resize", this.checkScreenSize);
    }
  },
  async mounted() {
    this.checkScreenSize();
    if (typeof window !== 'undefined') {
      window.addEventListener("resize", this.checkScreenSize, { passive: true });
    }
    this.fetchRandomGameRankings();
    await this.fetchGames();
  },
};
</script>

<style scoped>
/* Skiplink sichtbar beim Fokus */
.skip-link {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.skip-link:focus {
  position: static;
  width: auto;
  height: auto;
  margin: 0.5rem;
  padding: 0.5rem 0.75rem;
  outline: 2px solid;
}

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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: grid;
  place-items: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  max-width: 560px;
  width: 92vw;
  border-radius: 12px;
  padding: 1rem;
  outline: none;
}
.form-row { margin-bottom: 0.75rem; justify-content: space-between; }
.form-row label { display:flex; margin-bottom: 0.25rem; align-items: center; color: #355b4c;}
.form-row input[aria-invalid='true'] { border-color: #b00020; }
.error-text { color: #b00020; }
</style>
