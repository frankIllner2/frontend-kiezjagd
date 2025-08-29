<template>
  <div class="home-container">
    <HeaderMenu />

    <!-- Hero Section -->
    <section class="container top-header">
      <div>
        <div class="headline-container">
          <h1>Interaktive Abenteuer für deinen Kiez</h1>
          <div class="buttons">
            <button
              @click="scrollToSection('game-preview-section')"
              class="btn btn--primary"
              id="open-instruction"
            >
              Spiele entdecken
            </button>
            <button @click="scrollToSection('what-is-section')" class="btn btn--third">
              Was ist Kiezjagd?
            </button>
          </div>
        </div>

        <!-- AgeGroup -->
        <HomeSlider3 :games="games" />
      </div>
    </section>

    <!-- Headline Info Text -->
    <section id="what-is-headline" class="container what-is-headline">
      <div class="headline font-bold">
        <img class="inline-img" src="@/assets/img/icons/game-group.png" alt="Icon-Gril" />
        Entdecke dein Viertel neu: Löse knifflige Rätsel, finde versteckte Hinweise und
        meistere spannende Herausforderungen. Ob alleine oder mit deinem Team – erlebe
        bekannte Orte aus völlig neuen Blickwinkeln!
      </div>
    </section>

    <!-- Einführungstext -->
    <section id="what-is-section" class="container what-is-section">
      <div class="wapper">
        <h4>Was ist Kiezjagd?</h4>
        <div class="grid container cards">
          <!-- Card 1 -->
          <div class="card">
            <div class="icon">
              <img src="@/assets/img/icons/fritz.png" />
            </div>
            <div class="info">
              <h3>Dein Smartphone als Spielleiter</h3>
              <p>
                Mit deinem Smartphone begibst du dich auf eine Reise voller Überraschungen und Spaß.
                Während du online knifflige Rätsel löst, versteckte Hinweise findest und 
                spannende Herausforderungen meisterst, entdeckst du vertraute Orte aus völlig neuen Perspektiven
              </p>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="card">
            <div class="icon">
              <img src="@/assets/img/icons/frida.png" />
            </div>
            <div class="info">
              <h3>Dein interaktives Abenteuer</h3>
              <p>
                Kiezjagd ist mehr als nur ein Spiel – es ist ein interaktives Abenteuer, 
                das dich direkt in deinem Viertel herausfordert! Egal ob du allein, mit Freunden oder 
                deiner Familie unterwegs bist, jede Frage führt dich zu interessanten Plätzen, die du vielleicht noch nie bemerkt hast.
              </p>
            </div>
          </div>
        </div>
        <div class="button">
          <button
            @click="scrollToSection('game-preview-section')"
            class="btn btn--fourth"
            id="open-instruction"
          >
            Spiele entdecken
          </button>
        </div>
      </div>
    </section>

    <!-- Beliebte Spiele -->
    <HomeSlider :games="games" @open-modal="openModal" />

    <!-- Modal Fenster -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h2>Spiel kaufen: {{ currentGame?.name }}</h2>
        <p>
          Um dir den Spiel-Link nach dem Kauf zusenden zu können, benötigen wir deine
          E-Mail-Adresse:
        </p>

        <input type="email" v-model="userEmail" placeholder="E-Mail-Adresse" required />
        <input v-if="currentGame?.isVoucher" type="text" v-model="voucherCode" placeholder="Gutscheincode (optional)" />

        <!-- Fehlerhinweis -->
        <p v-if="checkoutError" class="mt-2 p-2">
          {{ checkoutError }}
        </p>

        <div class="modal-actions">
          <button class="btn btn--third" @click="closeModal" :disabled="isCheckingOut">Abbrechen</button>
          <button class="btn btn--primary" @click="handleCheckout" :disabled="isCheckingOut">
            {{ isCheckingOut ? 'Wird geprüft…' : 'Kaufen' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Vorteile als Cards -->
    <section id="features-section" class="container features-section">
      <h2>Warum Kiezjagd?</h2>
      <p>
        Kiezjagd ist mehr als nur ein Spiel – es ist ein interaktives Abenteuer dein
        Viertel zu entdecken.
      </p>

      <!-- 🚀 Desktop-Version (wird NUR über 600px angezeigt) -->
      <div class="grid container" v-if="!isMobile">
        <div class="info" v-for="(feature, index) in features" :key="index">
          <div class="icon">
            <img :src="feature.image" alt="Feature Icon" />
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
    <section class="container community-section">
      <div class="icons-header">
        <img src="@/assets/img/icons/fritz.png" />
        <img src="@/assets/img/icons/susi.png" />
        <img src="@/assets/img/icons/julia.png" />
        <img src="@/assets/img/icons/frank.png" />
      </div>
      <h2>Bereit für dein Abenteuer?</h2>
      <div class="container">
        <p>Melde dich jetzt an und werde Teil der Kiezjagd-Community</p>

        <button class="btn btn--third" @click="showNewsletterForm = true">
          Sign Up
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
    <NewsletterSignup :visible="showNewsletterForm" @close="showNewsletterForm = false" />
  </div>
</template>

<script>
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
      isMobile: window.innerWidth <= 600, // Initiale Prüfung
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
      isCheckingOut: false,     // 👈 neu
      checkoutError: "",        // 👈 neu
      features: [
        {
          title: "Um die Ecke",
          text:
            "Spannende Fragen direkt aus deiner Umgebung für Minis, Medis, Maxis.",
          image: fritz,
        },
        {
          title: "Immer griffbereit",
          text:
            "Spiele bequem auf deinem Smartphone oder Tablet.",
          image: frank,
        },
        {
          title: "Gemeinsam spielen",
          text:
            "Teile dein Abenteuer mit Freunden und Familie.",
          image: frida,
        },
        {
          title: "Werde KiezMeister",
          text:
            "Lasse dein Spielergebnis strahlen: verewige dich in unserer “Mitgemacht”- Liste!.",
          image: susi,
        },
      ],
    };
  },

  methods: {
    checkScreenSize() {
      this.isMobile = window.innerWidth <= 600;
    },
    getImagePath(imagePath) {
      return new URL(imagePath, import.meta.url).href;
    },
    scrollToSection(id) {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    },
    openInstruction1() {
      this.showInstruction1 = true;
    },
    closeInstruction1() {
      this.showInstruction1 = false;
    },
    openInstruction2() {
      this.showInstruction2 = true;
    },
    closeInstruction2() {
      this.showInstruction2 = false;
    },
    openInstruction3() {
      this.showInstruction3 = true;
    },
    closeInstruction3() {
      this.showInstruction3 = false;
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
      }
    },
    openModal(game) {
      if (!game || game.isDisabled) {
        alert("Dieses Spiel ist derzeit nicht verfügbar.");
        return;
      }
      this.currentGameId = game.encryptedId;
      this.currentGame = game;
      this.showModal = true;
      this.checkoutError = ""; // Reset Meldung beim Öffnen
    },
    closeModal() {
      this.showModal = false;
      this.userEmail = "";
      this.currentGameId = null;
      this.checkoutError = "";
      this.isCheckingOut = false;
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
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkScreenSize);
  },
  async mounted() {
    this.checkScreenSize();
    window.addEventListener("resize", this.checkScreenSize);
    this.fetchRandomGameRankings();
    await this.fetchGames();
  },
};
</script>
