<template>
  <div class="home-container">
    <HeaderMenu />

    <!-- Hero Section -->
    <section class="container top-header">
      <div>
        <div class="headline-container">
          <h1>Interaktive Abenteuer für deinen Kiez</h1>
          <div class="buttons">
              <button @click="scrollToSection('game-preview-section')" class="btn btn--primary" id="open-instruction">
                Spiele entdecken
              </button>
              <button @click="scrollToSection('what-is-section')" class="btn btn--third">
                Was ist Kiezjagd?
              </button>
          </div>
        </div>

        <div class="grid container cards age-group">
          <div class="card">
            <div class="img">
              <img src="@/assets/img/mini.jpg" />
            </div>
            <div class="content mini" @click="openInstruction1">
              <div>
                <b>3-5</b>
                <b>Mini</b>
                <img src="@/assets/img/icons/show-back.svg" />
              </div>
            </div>
            <InstructionLayer
              :isActive="showInstruction1"
              @close="closeInstruction1"
              title="Rätsel und Sterne"
              text="lorum lipsum lorum lipsum lorum lipsum lorum lipsum lorum lipsum lorum lipsum
              lorum lipsum lorum lipsum lorum lipsum lorum lipsum lorum lipsum lorum lipsum lorum lipsum
              lorum lipsum lorum lipsum lorum lipsum lorum lipsum lorum lipsum lorum lipsum lorum lipsum
              lorum lipsum lorum lipsum lorum lipsum lorum lipsum"
            />
          </div>

          <div class="card">
            <div class="img">
              <img src="@/assets/img/medi.jpg" />
            </div>
            <div class="content medi" @click="openInstruction2">
              <div>
                <b>5-9</b>
                <b>Medi</b>
                <img src="@/assets/img/icons/show-back.svg" />
              </div>
            </div>
            <InstructionLayer
              :isActive="showInstruction2"
              @close="closeInstruction2"
              title="Schnitzeljagd"
              text="Hier kommt die Anleitung für die Medi-Kategorie hin. Hier kommt die Anleitung für die Medi-Kategorie hin.
              Hier kommt die Anleitung für die Medi-Kategorie hin.Hier kommür die Medi-Kategorie hin.Hier kommt die Anleitung für die Medi-Kategorie hin.
              Hier kommt die Anleitung für die Medi-Kategorie hin"
            />
          </div>

          <div class="card">
            <div class="img">
              <img src="@/assets/img/maxi.jpg" />
            </div>
            <div class="content maxi" @click="openInstruction3">
              <div>
                <b>9-12</b>
                <b>Maxi</b>
                <img src="@/assets/img/icons/show-back.svg" />
              </div>
            </div>
            <InstructionLayer
              :isActive="showInstruction3"
              @close="closeInstruction3"
              title="die Besten"
              text="ier kommt die Anleitung für die Medi-Kategorie hin. Hier kommt die Anleitung für die Medi-Kategorie hin.
              Hier kommt die Anleitung für die Medi-Kategorie hin.Hier kommür die Medi-Kategorie hin.Hier kommt die Anleitung für die Medi-Kategorie hin.
              Hier kommt die Anleitung für die Medi-Kategori"
            />
          </div>
        </div>
      </div>
    </section>


    <!-- Headline Info Text -->

    <section class="container what-is-headline">
      <div class="headline font-bold ">
        Entdecke dein Viertel neu: Löse knifflige  <img class="inline-img" src="@/assets/img/icons/girl4.png" alt="Icon-Group"/>
        Rätsel, finde versteckte Hinweise und meistere spannende Herausforderungen. 
        Ob alleine oder mit deinem Team – erlebe bekannte <img class="inline-img" src="@/assets/img/icons/game-group.png" alt="Icon-Gril" /> Orte aus völlig neuen Blickwinkeln!
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
              <img src="@/assets/img/icons/hand.png" />
            </div>
            <div class="info">
            
              <h3>Dein Smartphone als Spielleiter</h3>
              <p>
                Das Eichhörnchen Hopsi hat sich im Land der Märchen verlaufen und sucht nun nach der richtigen Prinzessin, die 
                ihn nach Hause bringen kann. Kannst du ihm helfen, den richtigen Weg zu finden? Auf deinem Abenteuer musst du 
                Farben, Formen, Zahlen und Pflanzen richtig zuordnen, um Hinweise zu bekommen, wo du die Prinzessin findest.
              </p>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="card">
            <div class="icon">
              <img src="@/assets/img/icons/hand.png" />
            </div>
            <div class="info">
            
              <h3>Dein interaktives Abenteuer</h3>
              <p>
                Das Eichhörnchen Hopsi hat sich im Land der Märchen verlaufen und sucht nun nach der richtigen Prinzessin, 
                die ihn nach Hause bringen kann. Kannst du ihm helfen, den richtigen Weg zu finden? Auf deinem Abenteuer 
                musst du Farben, Formen, Zahlen und Pflanzen richtig zuordnen, um Hinweise zu bekommen, wo du die Prinzessin 
                findest.
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
        <h2>Spiel kaufen</h2>
        <p>
          Um dir den Spiel-Link nach dem Kauf zusenden zu können, benötigen wir deine
          E-Mail-Adresse:
        </p>
        <input type="email" v-model="userEmail" placeholder="E-Mail-Adresse" required />
        <div class="modal-actions">
          <button @click="handleCheckout">Bestätigen</button>
          <button @click="closeModal">Abbrechen</button>
        </div>
      </div>
    </div>



    <!-- Vorteile als Cards -->
    <section class="container features-section">
      <h2>Warum Kiezjagd?</h2>
      <p>
        Kiezjadg ist mehr als nur ein Spiel - es ist ein interaktives Abenteuer dein Viertel zu entdecken.
      </p>
      <div class="grid container">
        <div class="info">
          <div class="icon">
            <img src="@/assets/img/icons/boyYellowShoes.png" />
          </div>
          <div>
            <b>Um die Ecke</b><br />
            <span>
              Kiezjadg ist mehr als nur ein Spiel - es ist ein interaktives Abenteuer dein Viertel zu entdecken.
            </span>
          </div>
        </div>
        <div class="info">
          <div class="icon">
            <img src="@/assets/img/icons/girlYellowShirt.png" />
          </div>
          <div>
            <b>Immer griffbereit</b><br />
            <span>Kiezjadg ist mehr als nur ein Spiel - es ist ein interaktives Abenteuer dein Viertel zu entdecken.</span>
          </div>
        </div>
        <div class="info">
          <div class="icon">
            <img src="@/assets/img/icons/girlYellowHair.png" />
          </div>
          <div>
            <b>Gemeinsam spielen</b><br />
            <span>Kiezjadg ist mehr als nur ein Spiel - es ist ein interaktives Abenteuer dein Viertel zu entdecken.</span>
          </div>
        </div>
        <div class="info">
          <div class="icon">
            <img src="@/assets/img/icons/boyYellowShirt.png" />
          </div>
          <div>
            <b>Werde KiezMeister</b><br />
            <span> Kiezjadg ist mehr als nur ein Spiel - es ist ein interaktives Abenteuer dein Viertel zu entdecken. </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Top Teams Ranking -->
    <HomeSlider2 :rankings="randomRankings" />

    <!-- Call-to-Action -->
    <section class="container community-section">
      <div class="icons-header">
          <img src="@/assets/img/icons/boyYellowShoes.png" />
          <img src="@/assets/img/icons/girlYellowShirt.png" />
          <img src="@/assets/img/icons/girlYellowHair.png" />
          <img src="@/assets/img/icons/boyYellowShirt.png" />
      </div>
      <h2>Bereit für dein Abenteuer?</h2>
      <div class="container">
        <p>Melde dich jetzt an und werde Teil der Kiezjagd-Community</p>
       
        <button class="btn btn--fourth" @click="$router.push('/register')">
          Spiele entdecken
        </button>
      </div>
      <div class="bottom-menu">
        <div class="left">
          <span>Impressum</span>
          <span>Datenschutz</span>
        </div>

        <div class="right">
          <span>© 2025 Kiezjagd</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { apiService } from "@/services/apiService";
import HomeSlider from "@/components/HomeSlider.vue";
import InstructionLayer from '@/components/InstructionLayer.vue';
import HeaderMenu from "@/components/HeaderMenu.vue";
import HomeSlider2 from '@/components/HomeSlider2.vue';

export default {
  name: "HomePage",
  components: {
    HomeSlider,
    InstructionLayer,
    HeaderMenu,
    HomeSlider2
  },
  data() {
    return {
      topTeams: [],
      games: [],
      randomRankings: [],
      userEmail: "",
      showModal: false,
      currentGameId: null,
      showInstruction1: false,
      showInstruction2: false,
      showInstruction3: false,
    };
  },
  methods: {
    scrollToSection(id) {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
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
      try {
        const email =
          this.userEmail || prompt("Bitte geben Sie Ihre E-Mail-Adresse ein:");
        if (!email) {
          alert("⚠️ Eine E-Mail-Adresse ist erforderlich!");
          return;
        }
        if (!this.currentGameId) {
          alert("⚠️ Keine Spiel-ID gefunden!");
          return;
        }

        const { url } = await apiService.createCheckoutSession(this.currentGameId, email);
        window.location.href = url;
      } catch (error) {
        console.error("❌ Fehler beim Checkout:", error);
        alert("❌ Ein Fehler ist beim Checkout aufgetreten.");
      }
    },
    openModal(gameId) {
      const selectedGame = this.games.find((game) => game.encryptedId === gameId);
      console.log(selectedGame);
      if (!selectedGame || selectedGame.isDisabled) {
        alert("Dieses Spiel ist derzeit nicht verfügbar.");
        return;
      }
      this.currentGameId = gameId;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.userEmail = "";
      this.currentGameId = null;
    },
    async fetchRandomGameRankings() {
      try {
        // ✅ Zufällige Spiele abrufen
        console.log("🎲 Zufällige Spiele:");

        let randomGameIds = await apiService.getRandomGames();
        console.log("🎲 Zufällige Spiele:", randomGameIds);

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

        console.log("🏆 Top 5 Rankings:", this.randomRankings);
      } catch (error) {
        console.error("❌ Fehler beim Laden zufälliger Rankings:", error);
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

/* 📱 Mobile Optimierung */
@media (max-width: 768px) {
  .cards-container {
    grid-template-columns: 1fr;
  }
}

.home-container .age-group {
    position: relative;
}
.home-container .age-group .card .content {
    cursor: pointer;
}

/* 🟢 Vorteile als Cards */
.features-section {
  text-align: center;
  margin: 60px 0;
  padding: 40px 20px;
  border-radius: 8px;
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
  border-radius: 8px;
  text-align: center;
}

.game-preview-section h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.game-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.game-card {
  display: flex;
  flex-wrap: wrap;
  align-content: space-between;
  justify-content: space-around;
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

/* 🌐 Social Media */
.social-media-section {
  text-align: center;
  margin-top: 60px;
  padding: 10px 20px;
  background-color: #323c45;
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

}

.social-icon {
  font-size: 2rem;
  color: $primary-text-color;
  transition: color 0.3s ease;
}

.social-icon:hover {
  color: $secondary-text-color;
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
  background-color: #4caf50;
  color: white;
}

.modal-actions button:last-child {
  background-color: #fbc02d;
  color: white;
}
.bottom-menu {
  display: flex;
  justify-content: flex-end;
}
.bottom-menu span {
  color: whitesmoke;
  padding: 0 5px;
}
/* Mobile Optimierungen */
@media (max-width: 768px) {
  /* 📲 Call-to-Action */
  .cta-section {
    width: 85%;
  }
  .modal {
    width: 90%; /* Verkleinert das Modal für kleinere Geräte */
    max-width: 90%; /* Sicherstellen, dass es nicht über die Ränder hinausgeht */
    padding: 15px;
  }

  .modal-container h3 {
    font-size: 1.3rem;
  }

  .modal-container input[type="email"] {
    font-size: 0.9rem; /* Kleinere Schrift für Mobilgeräte */
  }

  .modal-container .btn-primary {
    font-size: 0.9rem; /* Kleinere Schriftgröße für Buttons */
    padding: 8px;
  }
}
</style>
