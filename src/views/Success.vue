<template>
  <div class="success-container">
    <h1>🎉 Zahlung erfolgreich!</h1>
    <p>Dein Spiel "{{ order.gameName }}" wurde erfolgreich erworben.</p>
    <p>Überprüfe deine E-Mail - dort befindet sich der Link zu deinem Spiel!</p>
    
    <!-- Ladeanzeige -->
    <div v-if="isLoading" class="loading">
      ⏳ Lade Bestellinformationen...
    </div>

    <!-- Fehleranzeige -->
    <div v-else-if="error" class="error">
      ❌ Fehler: {{ error }}
    </div>

    <!-- Bestellinformationen -->
    <div v-else-if="order">
      <h2>📝 Bestellinformationen</h2>
      <p><strong>Spiel:</strong> {{ order.gameName || 'Unbekannt' }}</p>
      <p><strong>E-Mail:</strong> {{ order.email || 'Keine E-Mail angegeben' }}</p>
      <p><strong>Zeitpunkt:</strong> {{ formattedTimestamp }}</p>

    </div>
    <router-link to="/" class="btn-primary">Zurück zur Startseite</router-link>
  </div>
</template>


<script>
import apiService from '@/services/apiService';

export default {
  name: 'SuccessPage',
  data() {
    return {
      sessionId: null, // Stripe-Session-ID aus der URL
      order: null, // Bestellinformationen
      error: null, // Fehlernachricht
      isLoading: true, // Ladeindikator
      gameLink: '', // Link zum Spiel
    };
  },
  computed: {
    formattedTimestamp() {
      // Formatiere das Datum der Bestellung
      if (!this.order || !this.order.timestamp) return 'N/A';
      return new Date(this.order.timestamp).toLocaleString();
    },
  },
  async mounted() {
    // Session-ID aus der URL auslesen
    this.sessionId = this.$route.query.session_id;

    if (!this.sessionId) {
      this.error = '⚠️ Keine Session-ID gefunden!';
      this.isLoading = false;
      return;
    }

    try {
      // ✅ Bestellstatus vom Backend abrufen
      console.log(`🔄 Lade Bestellinformationen für Session-ID: ${this.sessionId}`);
      const response = await apiService.fetchOrderStatus(this.sessionId);

      // Daten aktualisieren
     
      this.order = response.order;
      this.gameLink = response.gameLink;
    } catch (err) {
      console.error('❌ Fehler beim Abrufen der Bestellinformationen:', err);
      this.error = '❌ Bestellinformationen konnten nicht geladen werden.';
    } finally {
      this.isLoading = false;
    }
  },
};
</script>

<style scoped>
.success-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #4caf50;
  font-size: 2rem;
  margin-bottom: 10px;
}

p {
  font-size: 1rem;
  margin-bottom: 15px;
}

.loading {
  color: #ff9800;
  font-size: 1.2rem;
  margin: 20px 0;
}

.error {
  color: #f44336;
  font-size: 1.2rem;
  margin: 20px 0;
}

h2 {
  margin-top: 20px;
  font-size: 1.5rem;
  color: #333;
}

.btn-primary {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 1rem;
  color: #fff;
  background-color: #1976d2;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #135ba1;
}
</style>
