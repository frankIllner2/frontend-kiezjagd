<template>
  <div class="success-container">
    <h1>Zahlung erfolgreich!</h1>
    <p>Dein Spiel "{{ order.gameName }}" wurde erfolgreich erworben.</p>
    <p>Überprüfe deine E-Mail - dort befindet sich der Link zu deinem Spiel!</p>
    
    <!-- Ladeanzeige -->
    <div v-if="isLoading" class="loading">
      Lade Bestellinformationen...
    </div>

    <!-- Fehleranzeige -->
    <div v-else-if="error" class="error">
      Fehler: {{ error }}
    </div>

    <!-- Bestellinformationen -->
    <div v-else-if="order">
      <h2>Bestellinformationen</h2><br />
      <p><strong>Spiel:</strong> {{ order.gameName || 'Unbekannt' }}</p>
      <p><strong>E-Mail:</strong> {{ order.email || 'Keine E-Mail angegeben' }}</p>
      <p><strong>Zeitpunkt:</strong> {{ formattedTimestamp }}</p>

    </div>
    <router-link to="/" class="btn btn--primary">Zurück zur Startseite</router-link>
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
    this.sessionId = this.$route.query.session_id;

    if (!this.sessionId) {
      this.error = '⚠️ Keine Session-ID gefunden!';
      this.isLoading = false;
      return;
    }

    try {
      // 📨 Zahlung bestätigen und E-Mail auslösen
      await apiService.verifyPayment(this.sessionId);
      console.log('✅ verify-payment erfolgreich');

      // 🧾 Dann die Bestellinfo laden (optional)
      const response = await apiService.fetchOrderStatus(this.sessionId);
      this.order = response.order;
      this.gameLink = response.gameLink;
    } catch (err) {
      console.error('❌ Fehler bei Erfolg oder Verifikation:', err);
      this.error = '❌ Bestellinformationen konnten nicht geladen oder bestätigt werden.';
    } finally {
      this.isLoading = false;
    }
  },
};
</script>