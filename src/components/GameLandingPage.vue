<template>
  <!-- in der Datei data/slug-map.js kommen die Seiten rein -->
  <div v-if="loading" class="loading-spinner">
    <img src="@/assets/img/star.png" alt="Lädt..." class="rotating-star" />
    <span class="loading-text">Kiezjagd wird vorbereitet...</span>
  </div>

  <div v-else-if="error">{{ error }}</div>

  <div v-else class="game-landing-container">
    <!-- Game Card -->
    <div class="game-card">
      <router-link to="/" class="logo-lp">
        <img src="@/assets/img/logo.svg" alt="Kiezjagd Logo" />
      </router-link>

      <!-- Game Header -->
      <div class="game-header">
        <div class="image-container">
          <div class="wrapper">
            <img
              :src="gameData.gameImage"
              alt="Spielbild"
              class="game-image"
              v-if="gameData.gameImage"
            />
            <div class="badge">{{ gameData.ageGroup }}</div>
          </div>
        </div>

        <div class="game-details">
          <h1>{{ gameData.name }}</h1>
          <p>{{ gameData.description }}</p>
        </div>
      </div>

      <!-- Teaser Infos -->
      <div class="game-teasers">
        <div class="game-teaser price">
          <strong>Preis:</strong> {{ gameData.price }}
        </div>
        <div class="game-teaser duration">
          <strong>Spieldauer:</strong> {{ gameData.playtime }}
        </div>
        <div class="game-teaser start-location">
          <strong>Startort:</strong> {{ gameData.startloction }}
        </div>
        <div class="game-teaser end-location">
          <strong>Endort:</strong> {{ gameData.endloction }}
        </div>
      </div>

      <!-- Bestellbutton -->
      <div class="btn-container">
        <button @click="openModal" class="btn btn--primary">Jetzt spielen</button>
      </div>
    </div>

    <!-- Modal Fenster -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h2>Spiel kaufen</h2>
        <p>
          Um dir den Spiel-Link nach dem Kauf zusenden zu können, benötigen wir deine
          E-Mail-Adresse:
        </p>

        <input
          type="email"
          v-model="userEmail"
          placeholder="E-Mail-Adresse"
          required
        />

        <input
          v-if="gameData.isVoucher"
          type="text"
          v-model="voucherCode"
          placeholder="Gutscheincode (optional)"
        />

        <!-- FEHLERANZEIGE -->
        <p v-if="checkoutError" class="error-text">{{ checkoutError }}</p>

        <div class="modal-actions">
          <button class="btn btn--third" @click="closeModal">Abbrechen</button>
          <button
            class="btn btn--primary"
            @click="handleCheckout"
            :disabled="isCheckingOut"
          >
            {{ isCheckingOut ? "Wird verarbeitet…" : "Kaufen" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from "@/services/apiService";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // einfache, robuste Prüfung

export default {
  name: "GameLandingPage",
  props: ["encryptedId"],
  data() {
    return {
      gameData: null,
      loading: true,
      error: null,
      showModal: false,
      userEmail: "",
      voucherCode: "",
      checkoutError: "",
      isCheckingOut: false,
      currentGameId: null
    };
  },
  mounted() {
    this.loadGame();
  },
  methods: {
    async loadGame() {
      try {
        this.gameData = await apiService.fetchGameById(this.encryptedId);

        // Spiel-ID für Checkout bestimmen (robust gegen unterschiedliche Felder)
        this.currentGameId =
          this.gameData?._id ||
          this.gameData?.id ||
          this.encryptedId ||
          null;

        this.setMetaTags();
        document.dispatchEvent(new Event("render-event"));
      } catch (error) {
        console.error("Fehler beim Abrufen des Spiels:", error);
        this.error =
          error?.response?.data?.message || "Fehler beim Laden des Spiels";
      } finally {
        this.loading = false;
      }
    },

    setMetaTags() {
      const title =
        this.gameData?.name || "Kiezjagd – Das Outdoor-Abenteuer für Kinder";
      const description =
        this.gameData?.description ||
        "Erlebe spannende Rätsel und Abenteuer mit deiner Familie bei Kiezjagd – draußen, gemeinsam, in Berlin!";
      const image =
        this.gameData?.gameImage ||
        "https://www.kiezjagd.de/default-og-image.jpg";
      const url = `https://www.kiezjagd.de${this.$route.fullPath}`;
      const keywords = `Kiezjagd, Kinderspiel, Rätselspiel, Berlin, Outdoor, ${
        this.gameData?.location || ""
      }`;

      document.title = title;

      const setMeta = (name, content, attr = "name") => {
        let tag = document.querySelector(`meta[${attr}="${name}"]`);
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute(attr, name);
          document.head.appendChild(tag);
        }
        tag.setAttribute("content", content);
      };

      // Basis
      setMeta("description", description);
      setMeta("keywords", keywords);

      // OpenGraph
      setMeta("og:title", title, "property");
      setMeta("og:description", description, "property");
      setMeta("og:type", "website", "property");
      setMeta("og:url", url, "property");
      setMeta("og:image", image, "property");
      setMeta("og:site_name", "Kiezjagd", "property");

      // Twitter
      setMeta("twitter:card", "summary_large_image");
      setMeta("twitter:title", title);
      setMeta("twitter:description", description);
      setMeta("twitter:image", image);
      setMeta("twitter:site", "@kiezjagd");

      // Canonical
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", url);
    },

    openModal() {
      this.checkoutError = "";
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    // identische Prüf-/Fehlerlogik wie Home.vue + E-Mail-Validierung
    async handleCheckout() {
      this.checkoutError = "";
      this.isCheckingOut = true;
      try {
        const email = this.userEmail?.trim();
        const code = this.voucherCode?.trim() || null;

        if (!email) {
          this.checkoutError = "Eine E-Mail-Adresse ist erforderlich.";
          return;
        }
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
        const msg =
          payload.error || error?.message || "Checkout fehlgeschlagen.";

        if (code === "EMAIL_INVALID") {
          this.checkoutError = "Bitte gib eine gültige E-Mail-Adresse ein.";
        } else if (code === "PROMO_CODE_INVALID") {
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
    }
  }
};
</script>
