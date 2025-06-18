<template>
  <div v-if="loading">Lädt...</div>
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
                <img :src="gameData.gameImage" alt="Spielbild" class="game-image" v-if="gameData.gameImage" />
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
        <button @click="openModal" class="btn btn--primary">Jetzt bestellen</button>
      </div>
    </div>

    <!-- Modal Fenster -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h2>Spiel kaufen</h2>
        <p>Um dir den Spiel-Link nach dem Kauf zusenden zu können, benötigen wir deine E-Mail-Adresse:</p>
        <input type="email" v-model="userEmail" placeholder="E-Mail-Adresse" required />
        <div class="modal-actions">
          <button class="btn btn--third" @click="closeModal">Abbrechen</button>
          <button class="btn btn--primary" @click="handleCheckout">Kaufen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from '@/services/apiService';

export default {
  name: 'GameLandingPage',
  props: ['encryptedId'],
  data() {
    return {
      gameData: null,
      loading: true,
      error: null,
      showModal: false, // Modal sichtbar
      userEmail: '', // E-Mail für den Kauf
    };
  },
  mounted() {
    this.loadGame();
  },
  methods: {
    async loadGame() {
      try {
        this.gameData = await apiService.fetchGameById(this.encryptedId);
      } catch (error) {
        console.error("Fehler beim Abrufen des Spiels:", error);
        this.error = error.response?.data?.message || 'Fehler beim Laden des Spiels';
      } finally {
        this.loading = false;
      }
    },
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async handleCheckout() {
      try {
        const email =
          this.userEmail || prompt("Bitte geben Sie Ihre E-Mail-Adresse ein:");
        if (!email) {
          alert("⚠️ Eine E-Mail-Adresse ist erforderlich!");
          return;
        }
        if (!this.encryptedId) {
          alert("⚠️ Keine Spiel-ID gefunden!");
          return;
        }

        const { url } = await apiService.createCheckoutSession(this.encryptedId, email);
        window.location.href = url;
      } catch (error) {
        console.error("❌ Fehler beim Checkout:", error);
        alert("❌ Ein Fehler ist beim Checkout aufgetreten.");
      }
    },
  },
};
</script>

<style scoped>
/* Container für die gesamte Seite */
.game-landing-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Game Card (Container) */
.game-card {
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
}

/* Header mit Titel und Bild */
.game-header {
  position: relative;
  text-align: center;
  .game-details {
    padding: 20px 0;
  }
}

/* Bild Container für zentriertes Bild */
.image-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.image-container .wrapper {

  position: relative;
}


.game-image {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  object-fit: cover;
  max-height: 500px;
}

/* Badge oben rechts */
.badge {
  position: absolute;
  top: 0px;
  right: 0px;
  background-color: #FAC227;
  color: #000000;
  padding: 5px 10px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1rem;
}

/* Game Details */

.game-card {
  position: relative;
  padding: 20px;
  z-index: 1;
  &:before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: url('../assets/img/icons/girl2.svg');
    background-repeat: no-repeat;
    background-size: contain;
    background-position: bottom left;
    opacity: 0.05; /* Transparenz fürs Wasserzeichen */
    z-index: 0;
    pointer-events: none; /* Klicks gehen durch */
  }
  .logo-lp {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}


.game-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: #355b4c;
}

.game-header .game-age {
  font-size: 1.2rem;
  color: #355b4c;
  font-weight: bold;
}

/* Teaser Infos wie Preis, Dauer, Ort */
.game-teasers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.game-teaser {
  background-color: #FAC227;
  padding: 5px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.game-teaser strong {
  display: block;
  font-weight: normal;
  margin-bottom: 5px;
}

/* Button Container */
.btn-container {
  padding: 20px;
  text-align: center;
}

.btn {
  background-color: #355b4c;
  color: #ffffff;
  padding: 12px 25px;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: block;
  width: 100%;
  margin-top: 20px;
}

.btn--primary {
  background-color: #355b4c;
}

.btn--third {
  background-color: #dc3545;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
}

.modal-actions .btn {
  flex: 1;
  margin: 0 5px;
}

.modal-actions .btn--primary {
  background-color: #355b4c;
}

.modal-actions .btn--third {
  background-color: #dc3545;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .game-header h1 {
    font-size: 2rem;
  }

  .game-teasers {
    grid-template-columns: 50% 50%;
  }

  .game-teaser {
    font-size: 0.9rem;
    padding: 4px;
  }

  .btn {
    padding: 15px;
    font-size: 1.2rem;
  }

  .game-image {
    max-width: 100%;
  }
}
</style>

