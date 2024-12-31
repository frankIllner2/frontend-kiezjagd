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
          @click="$router.push('/game/b0235c812cb9a1a6ebaedfaec427a01b')"
          class="btn-primary"
        >
          Jetzt starten!
        </button>
      </div>
    </section>

    <!-- Einführungstext -->
    <section class="intro-section">
      <h2>🌟 Warum Kiezjagd spielen?</h2>
      <p>
        Kiezjagd ist mehr als nur ein Spiel – es ist ein interaktives Abenteuer, das dich direkt in deinem Viertel herausfordert! 🌍🚀 <br /> <br />Egal ob du alleine, mit Freunden, der Familie oder deinem Team unterwegs bist, jede Runde ist ein einzigartiges Erlebnis. Während du knifflige Rätsel löst, versteckte Hinweise findest und spannende Herausforderungen meisterst, entdeckst du vertraute Orte aus völlig neuen Perspektiven. 🧩🔍

<br />Mit deinem Smartphone als Spielleiter begibst du dich auf eine Reise voller Überraschungen und Spaß. Jede Frage ist sorgfältig auf deinen Kiez abgestimmt und führt dich zu interessanten Plätzen, die du vielleicht noch nie bemerkt hast. Ob historische Denkmäler, versteckte Gassen oder geheimnisvolle Gebäude – bei Kiezjagd wird jeder Spaziergang zum Abenteuer! 🏞️📱

Doch es geht nicht nur um Rätsel – es geht um Teamgeist, Strategie und das gemeinsame Erlebnis. Trete gegen andere Teams an, sichere dir deinen Platz in der Bestenliste und werde zum wahren Kiez-Meister! 🏆🔥

Bereit, deinen Kiez neu zu entdecken? Dann starte jetzt dein Abenteuer mit Kiezjagd und erlebe, wie aufregend deine Nachbarschaft sein kann! 🌟🎲
      </p>
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
      <h2>🏁 Top Teams der Woche</h2>
      <ul>
        <li class="rank-1">1. Team Blitzrätsel 🥇 0h 34m 21s</li>
        <li class="rank-2">2. Die Stadtfüchse 🥈 0h 45m 12s</li>
        <li class="rank-3">3. Rätseljäger 🥉 0h 50m 30s</li>
      </ul>
    </section>

    <!-- Beliebte Spiele -->
    <section class="game-preview-section">
      <h2>🎲 Beliebte Spiele</h2>
      <div class="game-cards">
        <div v-for="game in games" :key="game._id" class="game-card">
          <h3>{{ game.name }}</h3>
          <p>{{ game.description }}</p>
          <button
            @click="$router.push(`/game/${game.encryptedId}`)"
            class="btn-secondary"
          >
            Zum Spiel
          </button>
        </div>
      </div>
    </section>

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
      <h4>Folge uns auf Social Media!</h4>
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
    };
  },
  async mounted() {
    await this.fetchRanking();
    await this.fetchGames();
  },
  methods: {
    async fetchRanking() {
      try {
        const ranking = await apiService.fetchRanking("global");
        this.topTeams = ranking.slice(0, 5);
      } catch (error) {
        console.error("Fehler beim Laden des Rankings:", error);
      }
    },
    async fetchGames() {
      try {
        const games = await apiService.fetchGames();
        this.games = games.slice(0, 3);
      } catch (error) {
        console.error("Fehler beim Laden der Spiele:", error);
      }
    },
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



/* 📝 Einführungstext */
.intro-section {
  text-align: center;
  margin: 50px 0;
  padding: 30px 20px;
  background-color: #f0f8ff; /* Hellblauer Hintergrund */
  border-radius: 8px;
}

.intro-section h1 {
  font-size: 2.2rem;
  color: #4caf50;
  margin-bottom: 15px;
}

.intro-section p {
  font-size: 1.1rem;
  color: #444;
  margin-bottom: 20px;
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
.ranking-section {
  margin: 60px 0;
  padding: 30px 20px;
  background-color: #fff3e0; /* Hellorange Hintergrund */
  border-radius: 8px;
  text-align: center;
}

.ranking-section h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #fb8c00;
}

.ranking-section ul {
  list-style: none;
  padding: 0;
}

.ranking-section li {
  font-size: 1rem;
  margin: 8px 0;
  color: #444;
}

/* 🎲 Spielvorschau */
.game-preview-section {
  margin: 60px 0;
  padding: 40px 20px;
  background-color: #fce4ec; /* Hellrosa Hintergrund */
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
  border-radius: 8px;
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
  padding: 30px 20px;
  background-color: #f3e5f5; /* Helllila Hintergrund */
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

  .hero-image {
    height: 250px;
  }

  .intro-section p {
    font-size: 1rem;
  }
}
</style>
