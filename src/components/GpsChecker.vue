<template>
  <div class="gps-checker">
    <img
      v-if="question.imageUrl"
      :src="question.imageUrl"
      alt="Bild zur Anweisung"
      class="instruction-image"
    />

    <h3 v-html="question.question"></h3>

    <!-- 🔊 Vorlese-Button für Mini/Medi (Fragetext) -->
    <SpeechButton
      v-if="isKidsType"
      :text="question.question"
    /><br />

    <button
      class="btn btn--primary"
      @click="getLocation"
      :disabled="loading || locked || success"
      :aria-disabled="loading || locked || success"
    >
      <span v-if="locked">Standort prüfen (gesperrt)</span>
      <span v-else-if="success">Standort ok ✅</span>
      <span v-else-if="loading">Bestimme Standort…</span>
      <span v-else>Koordinaten senden</span>
    </button>

    <!-- ❗ Fehlerbereich + Ein-Klick-Vorlesen für Fehler+Tipps -->
    <div
      v-if="error"
      class="error-wrap"
      role="alert"
      aria-live="assertive"
    >
      <div class="error-texts">
        <p class="error">{{ error }}</p>
        <ul class="tips">
          <li>Aktiviere GPS/Standort am Gerät und erlaube den Zugriff im Browser.</li>
          <li>Geht ein paar Meter ins Freie oder wartet kurz für ein genaueres Signal.</li>
          <li>Prüft, ob ihr die Seite über https:// geöffnet habt.</li>
        </ul>
      </div>

      <!-- 🔊 Ein Klick: liest error + alle Tipps hintereinander -->
      <SpeechButton
        v-if="isKidsType"
        :key="readOutTextKey"
        :text="readOutText"
      />
    </div>

    <p v-if="success" class="success">Standort korrekt! Nächste Frage freigeschaltet.</p>
  </div>
</template>

<script>
import { apiService } from "@/services/apiService";
import SpeechButton from "@/components/SpeechButton.vue";

export default {
  name: "GpsChecker",
  components: { SpeechButton },
  emits: ["gpsSuccess", "gpsAttempt", "gpsFail"],
  props: {
    question: { type: Object, required: true },
    onSuccess: { type: Function, required: true },
    locked: { type: Boolean, default: false },
    gameType: { type: String, required: true }
  },
  data() {
    return {
      loading: false,
      error: null,
      success: false,
      attempts: 0,
      maxAttempts: 3,
    };
  },
  computed: {
    isKidsType() {
      return this.gameType === "Mini" || this.gameType === "Medi";
    },
    // Baut den kompletten Vorlesetext: Fehler + Tipps
    readOutText() {
      const header = this.error
        ? this.error
        : "Es gab ein Problem bei der Standortprüfung.";
      const tips = [
        "Aktiviere GPS oder Standort am Gerät und erlaube den Zugriff im Browser.",
        "Geht ein paar Meter ins Freie oder wartet kurz für ein genaueres Signal.",
        "Prüft, ob ihr die Seite über HTTPS geöffnet habt."
      ];
      // Absätze für klare Pausen im Sprachsynthese-Output
      return [header, ...tips].join("\n\n");
    },
    // Key erzwingt Neu-Render bei Textwechsel (z. B. neuer Fehler/Versuchszähler)
    readOutTextKey() {
      return `${this.error || ""}__${this.attempts}`;
    }
  },
  methods: {
    async getLocation() {
      if (this.locked || this.loading || this.success) return;

      this.loading = true;
      this.error = null;

      if (!navigator.geolocation) {
        this.error = "Dein Gerät unterstützt keine Standortbestimmung.";
        this.loading = false;
        this.$emit("gpsFail", { attempts: this.attempts, reason: "no_geolocation" });
        this.handleFailedAttempt();
        return;
      }

      this.attempts++;
      // 🔔 Game über aktuellen Stand informieren
      this.$emit("gpsAttempt", { attempts: this.attempts });

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const encryptedId =
              this.$route.params.gameId || localStorage.getItem("currentGameId");
            const resultApi = await apiService.verifyLocation(
              encryptedId,
              this.question._id,
              {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
              }
            );

            if (resultApi?.success) {
              this.success = true;
              // ⬇️ Animation in Game.vue starten (dort erfolgt auch der Wechsel zur nächsten Frage)
              this.$emit("gpsSuccess", { attempts: this.attempts });
            } else {
              this.error =
                "Ihr seid noch zu weit weg vom Zielpunkt. Geht näher hin und versucht es erneut.";
              this.$emit("gpsFail", { attempts: this.attempts, reason: "too_far" });
              this.handleFailedAttempt();
            }
          } catch (e) {
            this.error = "Standortprüfung fehlgeschlagen. Bitte später erneut versuchen.";
            this.$emit("gpsFail", { attempts: this.attempts, reason: "api_error", details: String(e) });
            this.handleFailedAttempt();
          } finally {
            this.loading = false;
          }
        },
        (geoErr) => {
          let msg = "Standort konnte nicht ermittelt werden.";
          if (geoErr.code === geoErr.PERMISSION_DENIED) {
            msg = "Standortfreigabe verweigert. Bitte erlaube den Zugriff.";
          } else if (geoErr.code === geoErr.POSITION_UNAVAILABLE) {
            msg = "Standortinformationen sind nicht verfügbar.";
          } else if (geoErr.code === geoErr.TIMEOUT) {
            msg = "Die Standortanfrage hat zu lange gedauert.";
          }
          this.error = `${msg} (Versuch ${this.attempts}/${this.maxAttempts})`;
          this.loading = false;
          this.$emit("gpsFail", {
            attempts: this.attempts,
            reason: "geo_error",
            details: { code: geoErr.code, message: msg }
          });
          this.handleFailedAttempt();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    },

    handleFailedAttempt() {
      if (this.attempts >= this.maxAttempts) {
        // Nach 3 Versuchen automatisch weiter (ohne Animation)
        this.error = null;
        this.success = true;
        this.onSuccess();
      }
    },
  },
};
</script>

<style scoped>
.instruction-image { max-width: 100%; margin-bottom: .75rem; }
.error-wrap { display:flex; align-items:flex-start; gap:.5rem; margin-top:.75rem; }
.error-texts { flex: 1 1 auto; }
.error { color: #b00020; margin: 0 0 .25rem; }
.success { color: #2e7d32; margin-top: .75rem; }
.tips { margin:.25rem 0 0; padding-left: 1.2rem; font-size: .95rem; }
.tips li { margin: .2rem 0; }
.btn[disabled] { opacity:.6; cursor:not-allowed; }
</style>
