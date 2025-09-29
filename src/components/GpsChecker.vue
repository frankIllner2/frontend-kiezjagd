<template>
  <div class="gps-checker">
    <img
      v-if="question.imageUrl"
      :src="question.imageUrl"
      alt="Bild zur Anweisung"
      class="instruction-image"
    />

    <h3 v-html="question.question"></h3>

    <!-- 🔊 Vorlese-Button für Mini/Medi -->
    <SpeechButton
      v-if="gameType === 'Mini' || gameType === 'Medi'"
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

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">Standort korrekt! Nächste Frage freigeschaltet.</p>

    <ul v-if="showTips" class="tips">
      <li>Aktiviere GPS/Standort am Gerät und erlaube den Zugriff im Browser.</li>
      <li>Geht ein paar Meter ins Freie oder wartet kurz für ein genaueres Signal.</li>
      <li>Prüft, ob ihr die Seite über https:// geöffnet habt.</li>
    </ul>
  </div>
</template>

<script>
import { apiService } from "@/services/apiService";
import SpeechButton from "@/components/SpeechButton.vue";

export default {
  name: "GpsChecker",
  components: { SpeechButton },
  props: {
    question: { type: Object, required: true },
    onSuccess: { type: Function, required: true },
    locked: { type: Boolean, default: false },
    gameType: { type: String, required: true } // 🔹 von Game.vue durchreichen
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
    showTips() {
      return !!this.error && !this.locked && !this.success;
    },
  },
  methods: {
    async getLocation() {
      if (this.locked || this.loading || this.success) return;

      this.loading = true;
      this.error = null;

      if (!navigator.geolocation) {
        this.error = "Dein Gerät unterstützt keine Standortbestimmung.";
        this.loading = false;
        this.handleFailedAttempt();
        return;
      }

      this.attempts++;

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
              this.onSuccess();
            } else {
              this.error =
                "Ihr seid noch zu weit weg vom Zielpunkt. Geht näher hin und versucht es erneut.";
              this.handleFailedAttempt();
            }
          } catch (e) {
            this.error = "Standortprüfung fehlgeschlagen. Bitte später erneut versuchen.";
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
          this.handleFailedAttempt();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    },

    handleFailedAttempt() {
      if (this.attempts >= this.maxAttempts) {
        // Nach 3 Versuchen automatisch weiter
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
.error { color: #b00020; margin-top: .75rem; }
.success { color: #2e7d32; margin-top: .75rem; }
.tips { margin-top: .5rem; padding-left: 1.2rem; font-size: .95rem; }
.tips li { margin: .2rem 0; }
.btn[disabled] { opacity:.6; cursor:not-allowed; }
</style>
