<template>
  <div class="gps-checker">
    <img v-if="question.imageUrl" :src="question.imageUrl" alt="Bild zur Anweisung" class="instruction-image" />
    <h3>{{ question.question }}</h3>
    <button class="btn btn--primary" @click="getLocation" :disabled="loading">
      {{ loading ? "Bestimme Standort..." : "Koordinaten senden" }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">Standort korrekt! Nächste Frage freigeschaltet.</p>
  </div>
</template>

<script>
import { apiService } from "@/services/apiService";

export default {
  props: {
    question: Object,
    onSuccess: Function, // Callback-Funktion aus Game.vue
  },
  data() {
    return {
      loading: false,
      error: null,
      success: false,
      attemptCount: 0, // Neuer Zähler
      maxAttempts: 3,
    };
  },
  methods: {
    async getLocation() {
      this.attemptCount++;

      if (this.attemptCount > this.maxAttempts) {
        this.success = true;
        this.error = null;
        this.onSuccess(); // Automatisch weiterschalten
        return;
      }

      this.loading = true;
      this.error = null;

      if (!navigator.geolocation) {
        this.error = "Geolocation wird nicht unterstützt.";
        this.loading = false;
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userCoordinates = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };

          try {
            const encryptedId =
              this.$route.params.gameId || localStorage.getItem("currentGameId");
            if (!encryptedId) {
              console.error("⚠️ Keine encryptedId gefunden!");
            } else {
              const resultApi = await apiService.verifyLocation(
                encryptedId,
                this.question._id,
                userCoordinates
              );
              console.log(resultApi);

              if (resultApi.success) {
                console.log("✅ Standort ist korrekt!");
                this.success = true;
                this.onSuccess(); // Nächste Frage freischalten
              } else {
                console.log("❌ Falsche Koordinaten");
              }
            }
          } catch (error) {
            this.error = "Fehler bei der API-Anfrage: " + error.message;
          }

          this.loading = false;
        },
        (error) => {
          let errorMessage = "Standort konnte nicht ermittelt werden.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "⚠️ Standortfreigabe verweigert. Bitte erlaube den Zugriff in den Browsereinstellungen.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "📡 Standortinformationen sind nicht verfügbar.";
              break;
            case error.TIMEOUT:
              errorMessage = "⏳ Die Standortanfrage hat zu lange gedauert.";
              break;
            case error.UNKNOWN_ERROR:
              errorMessage = "❓ Ein unbekannter Fehler ist aufgetreten.";
              break;
          }
          console.error(errorMessage);
          this.error = `${errorMessage} (${this.attemptCount}/${this.maxAttempts})`;
          this.loading = false;
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    },
  },
};
</script>

<style lang="scss" scoped>
img {
    max-width: 100%;
    height: auto;
}
  

</style>