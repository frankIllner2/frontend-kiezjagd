<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <img src="@/assets/hero.webp" alt="Kiezjagd Hero Image" class="hero-image" />
      <div class="hero-overlay">
        <h1>Willkommen bei Kiezjagd – Dein Abenteuer beginnt hier!</h1>
        <p>
          Entdecke deine Umgebung auf eine völlig neue Weise mit spannenden Rätseln und
          Herausforderungen. 🌍🔍
        </p>
        <button
          @click="$router.push('/game/aa7c546e650ecb922bb1b920d5e9ef7d')"
          class="btn-primary"
        >
          Jetzt starten!
        </button>
      </div>
    </section>

    <!-- Einführungstext -->
    <section class="why-kiezjagd-section">
    <h2>🌟 Warum Kiezjagd spielen?</h2>
    <div class="cards-container">
      <!-- Card 1 -->
      <div class="card">
        <h3>Das interaktive Abenteuer 🌍🚀</h3>
        <p>
          Kiezjagd ist mehr als nur ein Spiel – es ist ein interaktives Abenteuer, das dich direkt in deinem Viertel herausfordert! 
          Egal ob du alleine, mit Freunden, der Familie oder deinem Team unterwegs bist, jede Runde ist ein einzigartiges Erlebnis.
        </p>
        <p>
          Während du knifflige Rätsel löst, versteckte Hinweise findest und spannende Herausforderungen meisterst, 
          entdeckst du vertraute Orte aus völlig neuen Perspektiven. 🧩🔍
        </p>
      </div>

      <!-- Card 2 -->
      <div class="card">
        <h3>Dein Smartphone als Spielleiter 📱🏞️</h3>
        <p>
          Mit deinem Smartphone begibst du dich auf eine Reise voller Überraschungen und Spaß. Jede Frage führt dich zu interessanten Plätzen,
          die du vielleicht noch nie bemerkt hast. Ob historische Denkmäler, versteckte Gassen oder geheimnisvolle Gebäude.
        </p>
        <p>
          Trete gegen andere Teams an, sichere dir deinen Platz in der Bestenliste und werde zum wahren Kiez-Meister! 🏆🔥
          Starte jetzt dein Abenteuer und erlebe, wie aufregend deine Nachbarschaft sein kann! 🌟🎲
        </p>
      </div>
    </div>
  </section>

    <!-- Vorteile als Cards -->
    <section class="features-section">
      <h2>🔑 Was erwartet dich?</h2>
      <div class="features-grid">
        <div class="feature-card card-blue">
          <font-awesome-icon :icon="['fas', 'puzzle-piece']" class="feature-icon" />
          <h3>🎯 Maßgeschneiderte Rätsel</h3>
          <p>Spannende Fragen direkt aus deiner Umgebung.</p>
        </div>
        <div class="feature-card card-green">
          <font-awesome-icon :icon="['fas', 'mobile-alt']" class="feature-icon" />
          <h3>📱 Immer griffbereit</h3>
          <p>Spiele bequem auf deinem Smartphone oder Tablet.</p>
        </div>
        <div class="feature-card card-yellow">
          <font-awesome-icon :icon="['fas', 'users']" class="feature-icon" />
          <h3>🤝 Gemeinsam spielen</h3>
          <p>Teile das Abenteuer mit Freunden und Familie.</p>
        </div>
        <div class="feature-card card-red">
          <font-awesome-icon :icon="['fas', 'trophy']" class="feature-icon" />
          <h3>🏆 Werde Kiez-Meister</h3>
          <p>Erkämpfe dir deinen Platz auf dem Siegerpodest.</p>
        </div>
      </div>
    </section>

    <!-- Top Teams Ranking -->
    <section class="ranking-section">
      <h2>🏆 Top Rankings der Spiele</h2>
      <div class="rankings-container">
        <div
          v-for="(ranking, index) in randomRankings"
          :key="index"
          class="ranking-card"
        >
          <h3>{{ ranking.gameName }}</h3>
          <ul>
            <li v-for="(result, idx) in ranking.topResults" :key="idx">
              <strong>{{ idx + 1 }}.</strong> {{ result.teamName }} - {{ result.duration }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Beliebte Spiele -->
    <section class="game-preview-section">
      <h2>🎲 Beliebte Spiele</h2>
      <div class="game-cards">
        <div v-for="game in games" :key="game._id" class="game-card">
          <h3>{{ game.name }}</h3>
          <p>{{ game.description }}</p>
          <button @click="openModal(game.encryptedId)">
            Spiel kaufen
          </button>
        </div>
      </div>
    </section>

    <!-- Modal Fenster -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h2>🎟️ Spiel kaufen</h2>
        <p>Um dir den Spiel-Link nach dem Kauf zusenden zu können, benötigen wir deine E-Mail-Adresse:</p>
        <input
          type="email"
          v-model="userEmail"
          placeholder="E-Mail-Adresse"
          required
        />
        <div class="modal-actions">
          <button @click="handleCheckout">Bestätigen</button>
          <button @click="closeModal">Abbrechen</button>
        </div>
      </div>
    </div>

    <!-- Call-to-Action -->
    <section class="cta-section">
      <h2>🌟 Bereit für dein Abenteuer?</h2>
      <p>Melde dich jetzt an und werde Teil der Kiezjagd-Community!</p>
      <button @click="$router.push('/register')" class="btn-primary">
        Jetzt registrieren
      </button>
    </section>

    <!-- Social Media -->
    <section class="social-media-section">
      
      <div class="social-icons">
        <a href="https://facebook.com" target="_blank">
          <font-awesome-icon :icon="['fab', 'facebook']" class="social-icon facebook" />
        </a>
        <a href="https://twitter.com" target="_blank">
          <font-awesome-icon :icon="['fab', 'twitter']" class="social-icon twitter" />
        </a>
        <a href="https://instagram.com" target="_blank">
          <font-awesome-icon :icon="['fab', 'instagram']" class="social-icon instagram" />
        </a>
      </div>
    </section>
  </div>
</template>

<script>
import { apiService } from "@/services/apiService";

export default {
  name: "HomePage",
  data() {
    return {
      topTeams: [],
      games: [],
      randomRankings: [],
      userEmail: '',
      showModal: false, 
    };
  },
  methods: {

    async fetchGames() {
      try {
        const games = await apiService.fetchGames();
        this.games = games.slice(0, 3);
      } catch (error) {
        console.error("Fehler beim Laden der Spiele:", error);
      }
    },
    async handleCheckout(gameId) {
      try {
        const email = this.userEmail || prompt('Bitte geben Sie Ihre E-Mail-Adresse ein:');
        if (!email) {
          alert('⚠️ Eine E-Mail-Adresse ist erforderlich!');
          return;
        }
        const { url } = await apiService.createCheckoutSession(gameId, email);
        window.location.href = url;
      } catch (error) {
        console.error('❌ Fehler beim Checkout:', error);
        alert('❌ Ein Fehler ist beim Checkout aufgetreten.');
      }
    },
    openModal(gameId) {
      this.selectedGameId = gameId;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.userEmail = "";
    },
    async fetchRandomGameRankings() {
      try {
        // ✅ Zufällige Spiele abrufen
        console.log('🎲 Zufällige Spiele:');


        const randomGameIds = await apiService.getRandomGames();
        console.log('🎲 Zufällige Spiele:', randomGameIds);

        if (!randomGameIds || randomGameIds.length === 0) {
          console.warn('⚠️ Keine zufälligen Spiele gefunden');
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
          .filter(ranking => ranking !== null)
          .map((ranking, index) => ({
            gameId: randomGameIds[index],
            gameName: ranking.gameName,
            topResults: ranking.topResults,
          }));
        
        console.log('🏆 Top 5 Rankings:', this.randomRankings);
      } catch (error) {
        console.error('❌ Fehler beim Laden zufälliger Rankings:', error);
      }
    },
    
  },
  async mounted() {
    this.fetchRandomGameRankings();
    await this.fetchGames();

  },
};
</script>
<style scoped>

/* Container */
/* 🎯 Allgemeine Layout-Stile */
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 🎯 Hero Section */
.hero-section {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
  margin-bottom: 30px;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7); /* Abdunklung für besseren Kontrast */
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 35%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
}

.hero-overlay h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.hero-overlay p {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.hero-overlay .btn-primary {
  background-color: #ff9800;
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.hero-overlay .btn-primary:hover {
  background-color: #e68900;
}


/* 🌟 Allgemeine Styles für den Abschnitt */
.why-kiezjagd-section {
  text-align: center;
  margin: 50px auto;
  padding: 30px 20px;
  background-color: #f5f9ff;
  border-radius: 12px;
}

/* 🎯 Überschrift */
.why-kiezjagd-section h2 {
  font-size: 2rem;
  margin-bottom: 20px;
  color: #4a90e2;
}

/* 📦 Cards-Container */
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* 🃏 Einzelne Card */
.card {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: left;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* 🎨 Hover-Effekt */
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

/* 📝 Card Titel */
.card h3 {
  font-size: 1.4rem;
  margin-bottom: 10px;
  color: #1976d2;
}

/* 📄 Card Text */
.card p {
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
}

/* 📱 Mobile Optimierung */
@media (max-width: 768px) {
  .cards-container {
    grid-template-columns: 1fr;
  }
}

/* 🟢 Vorteile als Cards */
.features-section {
  text-align: center;
  margin: 60px 0;
  padding: 40px 20px;
  background-color: #e8f5e9; /* Hellgrüner Hintergrund */
  border-radius: 8px;
}

.features-section h2 {
  font-size: 1.8rem;
  margin-bottom: 25px;
  color: #388e3c;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-card {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

/* 🏆 Ranking-Section */
/* 🌟 Ranking Section */
.ranking-section {
  margin-top: 30px;
  text-align: center;
}

.ranking-section h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #4caf50;
}

/* 🌟 Container für die Cards */
.rankings-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* 🌟 Einzelne Ranking-Card */
.ranking-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  text-align: left;
  transition: transform 0.2s ease-in-out;
}

.ranking-card:hover {
  transform: scale(1.02);
}

.ranking-card h3 {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #333;
  text-align: center;
}

/* 🌟 Ranking-Liste */
.ranking-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ranking-card li {
  display: flex;
  justify-content: flex-start;
  margin: 5px 0;
  font-size: 0.9rem;
  padding: 5px;
  border-bottom: 1px solid #f0f0f0;
}
.ranking-card li strong {
  padding: 0 20px 0 0;
}

.ranking-card li:last-child {
  border-bottom: none;
}

/* 🌟 Responsiveness */
@media (max-width: 768px) {
  .rankings-container {
    grid-template-columns: 1fr;
  }

  .ranking-card {
    padding: 10px;
  }
}


/* 🎲 Spielvorschau */
.game-preview-section {
  margin: 60px 0;
  padding: 40px 20px;
  background-color: whitesmoke; 
  border-radius: 8px;
  text-align: center;
}

.game-preview-section h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #d81b60;
}

.game-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.game-card {
  background: #ffffff;
  padding: 20px;
  border-radius: 2px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

/* 📲 Call-to-Action */
.cta-section {
  margin: 60px 0;
  padding: 40px 20px;
  background-color: #e3f2fd; /* Hellblauer Hintergrund */
  border-radius: 8px;
  text-align: center;
}

.cta-section h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #1976d2;
}

.cta-section p {
  font-size: 1rem;
  margin-bottom: 20px;
  color: #444;
}

.cta-section .btn-primary {
  background-color: #1976d2;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 1rem;
}

/* 🌐 Social Media */
.social-media-section {
  text-align: center;
  margin-top: 60px;
  padding: 10px 20px;
  background-color: whitesmoke; /* Helllila Hintergrund */
  border-radius: 8px;
}

.social-media-section h2 {
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #7b1fa2;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
}

.social-icon {
  font-size: 2rem;
  color: #7b1fa2;
  transition: color 0.3s ease;
}

.social-icon:hover {
  color: #4a148c;
}

/* 🦶 Footer */
.footer {
  background-color: #424242;
  color: #fff;
  text-align: center;
  padding: 15px 0;
  margin-top: 40px;
  font-size: 0.9rem;
}

.footer a {
  color: #fbc02d;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}


/* 📱 Mobile Optimierung */
@media (max-width: 768px) {
  .game-cards,
  .features-grid {
    grid-template-columns: 1fr;
  }
  .hero-overlay {

    width: 100%;

    }

  .intro-section p {
    font-size: 1rem;
  }
}

/* Modal Layer */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: #ffffff;
  border-radius: 8px;
  width: 400px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal h2 {
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.modal p {
  margin-bottom: 15px;
  font-size: 1rem;
}

.modal input {
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.modal-actions button {
  flex: 1;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
}

.modal-actions button:first-child {
  background-color: #1976d2;
  color: white;
}

.modal-actions button:last-child {
  background-color: #f44336;
  color: white;
}
/* Mobile Optimierungen */
@media (max-width: 768px) {
  .modal {
    width: 90%; /* Verkleinert das Modal für kleinere Geräte */
    max-width: 90%; /* Sicherstellen, dass es nicht über die Ränder hinausgeht */
    padding: 15px;
  }

  .modal-container h3 {
    font-size: 1.3rem;
  }

  .modal-container input[type='email'] {
    font-size: 0.9rem; /* Kleinere Schrift für Mobilgeräte */
  }

  .modal-container .btn-primary {
    font-size: 0.9rem; /* Kleinere Schriftgröße für Buttons */
    padding: 8px;
  }
}
</style>
