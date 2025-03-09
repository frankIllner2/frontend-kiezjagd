<template>
  <div class="game-container">
    <!-- Begrüßung und Spielname -->
    <div class="game-header">
  
      <div v-if="!this.gameStarted" class="img">
        <img src="@/assets/img/logo.png" />
      </div>
      <h2>Dein Abenteuer startet jetzt!</h2>
      <h3 v-if="gameName && !gameFinished">Du spielst "{{ gameName }}"</h3>
      <h3 v-if="gameFinished">Du hast gespielt: "{{ gameName }}"</h3>
    </div>

    <!-- Startformular -->
    <div v-if="!gameStarted" class="game-card start-form">
      <StartForm
        :gameId="gameId"
        :teamName="teamName"
        :email="email"
        :playerCount="playerCount"
        :playerNames="playerNames"
        :teamExists="teamExists"
        @checkTeamName="checkTeamName"
        @startGame="startGame"
      />
    </div>

    <!-- Fragenbereich -->
    <div v-else-if="!gameFinished" class="game-card question-section">
      <!-- Timer bleibt immer aktiv, wird aber bei Mini & Medi versteckt -->
      <GameTimer
        v-if="gameType === 'Maxi' || gameType === 'Mini' || gameType === 'Medi'"
        :gameDuration="gameDuration"
        class="timer"
        :class="{ hidden: gameType !== 'Maxi' }"
      />

      <GameQuestion
        v-if="currentQuestion"
        :question="currentQuestion"
        :currentIndex="currentQuestionIndex"
        @submitAnswer="handleAnswer"
      />

      <GpsChecker
        v-if="currentQuestion && currentQuestion.type === 'anweisung'"
        :question="currentQuestion"
        :onSuccess="nextQuestion"
      />

      <!-- Feedback Overlay mit Sterne-Animation -->
      <div v-if="showFeedback" class="feedback-overlay">
        <div class="feedback-content">
          <p>{{ feedbackMessage }}</p>
          <img v-if="feedbackImage" :src="feedbackImage" alt="Antwort Feedback" />
        </div>
      </div>

      <div v-if="starAnimation && gameType !== 'Maxi'" class="star-container">
        <transition-group name="star-fly">
          <div v-for="star in flyingStars" :key="star.id" class="star">⭐</div>
        </transition-group>
      </div>

      <div class="star-status">
        <p v-if="gameType === 'Maxi'">
          <strong>Zeit benötigt:</strong> {{ gameDuration }}
        </p>
        <p v-else><strong>Gesammelte Sterne:</strong> 🌟 {{ starCount }}</p>
      </div>
    </div>

    <!-- Spielabschluss -->
    <div v-else class="game-card game-finished">
      <h3>Spiel erfolgreich abgeschlossen!</h3>
      <div>
        <p><strong>Team:</strong> {{ teamName }}</p>
        <p><strong>E-Mail:</strong> {{ email }}</p>
        <p v-if="gameType === 'Maxi'">
          <strong>Zeit benötigt:</strong> {{ gameDuration }}
        </p>
        <p v-else><strong>Gesammelte Sterne:</strong> 🌟 {{ starCount }}</p>
        <p>Vielen Dank für's Spielen!</p>
      </div>
      <button @click="goToHome" class="btn-primary">Zurück zur Startseite</button>
    </div>
  </div>
</template>

<script>
import StartForm from "@/components/StartForm.vue";
import GameQuestion from "@/components/GameQuestion.vue";
import GameTimer from "@/components/GameTimer.vue";
import GpsChecker from "@/components/GpsChecker.vue";
import { apiService } from "@/services/apiService";

export default {
  components: { StartForm, GameQuestion, GameTimer, GpsChecker },
  data() {
    return {
      gameId: null,
      gameName: "",
      teamName: "",
      email: "",
      playerCount: 1,
      playerNames: [],
      teamExists: false,
      questions: [],
      currentAnswerQuestion: '',
      currentQuestionIndex: 0,
      gameStarted: false,
      gameFinished: false,
      gameDuration: "0h 0m 0s",
      showFeedback: false,
      feedbackMessage: "",
      timerInterval: null,
      startTime: null,
      endTime: null,
      feedbackImage: null,
      starCount: 0, // Gesamtzahl der Sterne
      earnedStars: 0, // Sterne für die aktuelle Antwort
      starAnimation: false, // Steuerung der Animation
      attemptCount: 0, // Zählt die Versuche für jede Frage
      gameType: "",
      flyingStars: [],
    };
  },
  name: "GamePage",
  computed: {
    currentQuestion() {
      return this.questions.length > 0 &&
        this.currentQuestionIndex < this.questions.length
        ? this.questions[this.currentQuestionIndex]
        : null;
    },
  },
  watch: {
    flyingStars(newStars) {
      console.log("🔥 Sterne im Array: ", newStars);
    },
  },

  async mounted() {
    // Prüfe, ob ein gespeicherter Spielstatus vorhanden ist
    const savedGameId = localStorage.getItem("currentGameId");
    const gameInProgress = localStorage.getItem("gameInProgress") === "true";
    const savedIndex = parseInt(
      localStorage.getItem(`currentQuestionIndex_${savedGameId}`),
      10
    );

    if (gameInProgress && savedGameId) {
      // Wiederherstellung des gespeicherten Spiels
      this.gameId = savedGameId;
      this.teamName = localStorage.getItem("teamName") || "";
      this.email = localStorage.getItem("email") || "";
      this.currentQuestionIndex = savedIndex || 0;
      this.gameStarted = true;
      this.starCount = parseInt(localStorage.getItem("starCount"), 10) || 0;
      this.startTime = parseInt(localStorage.getItem("startTime"), 10) || Date.now();
      console.log(
        `📍 Wiederhergestelltes Spiel: ${this.gameId}, Startzeit: ${this.startTime}`
      );
      this.startTimer();
    } else {
      // Spiel von vorne starten
      this.gameId = this.$route.params.gameId || null;
    }

    this.gameId = this.$route.params.gameId || this.$route.params.encryptedId;

    if (!this.gameId) {
      console.error("⚠️ Fehler: gameId ist nicht vorhanden!");
      return;
    }

    // Lade Spielinformationen
    if (this.gameId) {
      await this.loadGameData(this.gameId);
    }
  },
  methods: {
    async loadGameData(gameId) {
      try {
        const response = await apiService.fetchGameById(gameId);
        this.gameName = response.name || "Unbekanntes Spiel";
        this.questions = response.questions || [];
        this.gameType = response.ageGroup || "Maxi";
       
        console.log("🔄 Spieldaten geladen:", response);
      } catch (error) {
        console.error("❌ Fehler beim Laden des Spiels:", error);
      }
    },
    startGame(payload) {
      this.startTimer();
      const { teamName, email, playerNames } = payload;

      if (!teamName || !email) {
        alert("⚠️ Bitte Teamname und E-Mail eingeben.");
        return;
      }

      this.teamName = teamName;
      this.email = email;
      this.playerNames = playerNames;
      this.startTime = Date.now();
      this.gameStarted = true;

      // Spielstatus in localStorage speichern
      localStorage.setItem("gameInProgress", "true");
      localStorage.setItem("currentGameId", this.gameId);
      localStorage.setItem("teamName", teamName);
      localStorage.setItem("email", email);
      localStorage.setItem("startTime", this.startTime);
      localStorage.setItem("playerNames", JSON.stringify(playerNames));
    },
    handleAnswer({ isCorrect }) {
      console.log("handleAnswer called", isCorrect);
      this.starAnimation = true;
      this.currentAnswerQuestion = this.currentQuestion;
  
      if (isCorrect) {
        this.earnedStars = this.calculateStars();
        this.feedbackMessage = this.currentAnswerQuestion.answerquestion;
        this.feedbackImage = require("@/assets/img/correct.gif");
        this.showFeedback = true;

        setTimeout(() => {
          this.showFeedback = false; // ✅ Feedback-Layer ausblenden

          // 🟢 Warten, bis `.feedback-overlay` entfernt wurde, dann Sterne starten
          this.$nextTick(() => {
            setTimeout(() => {
              this.animateStars(); 
            }, 500); 
          });
        }, 5000);
      } else {
        this.attemptCount++;
        this.feedbackMessage = "Versuche es nochmal!";
        this.feedbackImage = require("@/assets/img/false.png");
        this.showFeedback = true;

        setTimeout(() => {
          this.showFeedback = false;
        }, 5000);
      }
    },

    animateStars() {
      console.log('animate Stars');
      if (this.gameType === 'Maxi') this.nextQuestion();
      this.flyingStars = []; // ⭐ Setze Array immer auf leer
      let addedStars = 0;

      console.log("🚀 Starte Stern-Animation...");

      const interval = setInterval(() => {
        console.log("🌟 Neuer Stern wird hinzugefügt!", addedStars);

        if (addedStars < this.earnedStars) {
          this.flyingStars.push({ id: addedStars, flying: true });
          this.starCount++; // Zahl erhöht sich synchron zur Animation
          localStorage.setItem("starCount", this.starCount);
          addedStars++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            console.log("🎯 Animation abgeschlossen. Wechsel zur nächsten Frage.");
            this.starAnimation = false;
            this.flyingStars = []; // Array zurücksetzen
            this.nextQuestion(); // ✅ Jetzt erst zur nächsten Frage wechseln!
          }, 1000);
        }
      }, 1000);
    },

    calculateStars() {
      if (this.attemptCount === 0) return 5;
      if (this.attemptCount === 1) return 3;
      return 1;
    },

    nextQuestion() {
      this.attemptCount = 0; // ✅ Versuche zurücksetzen
      console.log("Wechsel zu nächster Frage:", this.currentQuestionIndex);
      console.log(this.questions.length - 1);
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        this.saveQuestionIndex();
      } else {
        console.log("finishGame");
        this.finishGame();
      }
    },
    saveQuestionIndex() {
      localStorage.setItem(
        `currentQuestionIndex_${this.gameId}`,
        this.currentQuestionIndex
      );
      console.log(`📍 Fortschritt gespeichert: Frage ${this.currentQuestionIndex + 1}`);
    },
    startTimer() {
      this.timerInterval = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = Math.round((currentTime - this.startTime) / 1000);
        const hours = Math.floor(elapsedTime / 3600);
        const minutes = Math.floor((elapsedTime % 3600) / 60);
        const seconds = elapsedTime % 60;
        this.gameDuration = `${hours}h ${minutes}m ${seconds}s`;
      }, 1000);
    },
    async finishGame() {
      try {
        clearInterval(this.timerInterval);
        this.endTime = Date.now();
        this.gameFinished = true;

        const durationInSeconds = Math.round((this.endTime - this.startTime) / 1000);
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = durationInSeconds % 60;
        const formattedDuration = `${hours}h ${minutes}m ${seconds}s`;

        const resultPayload = {
          gameId: this.gameId,
          teamName: this.teamName,
          email: this.email,
          gameType: this.gameType,
          gameName: this.gameName,
          startTime: new Date(this.startTime).toISOString(),
          endTime: new Date(this.endTime).toISOString(),
          duration: formattedDuration,
          stars: this.starCount,
        };

        console.log("📤 Ergebnis wird gesendet:", resultPayload);
        await apiService.saveGameResult(resultPayload);

        // Lokale Daten bereinigen
        localStorage.removeItem("teamName");
        localStorage.removeItem("email");
        localStorage.removeItem("gameInProgress");
        localStorage.removeItem("startTime");
        localStorage.removeItem(`currentQuestionIndex_${this.gameId}`);
        localStorage.removeItem("starCount"); // **Sterne nach Spielende zurücksetzen**
      } catch (error) {
        console.error("❌ Fehler beim Speichern der Ergebnisse:", error);
        alert("❌ Fehler beim Speichern der Ergebnisse. Bitte versuche es erneut.");
      } finally {
        clearInterval(this.timerInterval);
      }
    },

    goToHome() {
      this.$router.push("/");
    },
  },
  beforeUnmount() {
    clearInterval(this.timerInterval);
  },
};
</script>

<style scoped>
/* Allgemeine Spielcontainer-Stile */
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}

/* Header */
.game-header {
  text-align: center;
}

.game-header h1 {
  margin-bottom: 5px;
}

.game-header h2 {
  color: #355b4c;
}

/* Karten-Design */
.game-card {
  width: 100%;
  text-align: center;
}

/* Startformular */
.start-form {
  text-align: left;
}

/* Fragenbereich */
.question-section {
  text-align: center;
}

.question-section h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

/* Feedback-Nachricht */
.feedback {
  margin-top: 15px;
  font-size: 1rem;
  font-weight: bold;
  color: #4caf50;
}

/* Spiel abgeschlossen */
.game-finished {
  text-align: center;
}

.game-finished h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #4caf50;
}

.game-finished p {
  margin: 5px 0;
  font-size: 1rem;
  color: #333;
}

/* Button */
.btn-primary {
  background-color: #4caf50;
  color: white;
  font-size: 1rem;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 15px;
}

.btn-primary:hover {
  background-color: #388e3c;
}

.feedback-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(250, 194, 39, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  text-align: center;
}

.feedback-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 90%;
  width: 80vw; /* Feste Breite für mobile Geräte */
  text-align: center;
  p {
    color: #355b4c;
    font-size: clamp(1.4rem, 4vw, 3em);
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
    width: 80vw; /* Feste Breite, damit der Text umbricht */
    max-width: 600px; /* Begrenzung für größere Bildschirme */
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
    line-height: 1.2; /* Guter Zeilenabstand für bessere Lesbarkeit */
    margin-top: 10px;
  }
}
.hidden {
  display: none;
}
.feedback-content img {
  margin-top: 20px;
  max-height: 80vh;
}
.feedback-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(250, 194, 39, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  text-align: center;
}

.feedback-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 90%;
}

.star-container {
  position: fixed;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

@keyframes fly-to-status {
  0% {
    transform: translateY(100vh) scale(1);
    opacity: 1;
  }
  40% {
    /* Früher in der Mitte */
    transform: translate(30vw, -60vh) scale(1.4);
    opacity: 1;
  }
  100% {
    transform: translate(45vw, -100vh) scale(0.8);
    opacity: 0;
  }
}

.star {
  font-size: 50px;
  position: absolute;
  animation: fly-to-status 3s ease-in-out forwards;
}

/* Fixierte Sterne-Anzeige unten */
.star-status {
  position: fixed;
  top: 10px;
  right: 0;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  color: black;
  z-index: 10; /* Sicherstellen, dass es unter dem Button bleibt */
  pointer-events: none; /* Verhindert, dass es Klicks blockiert */
  background-color: #e9e2d0;
  padding: 0 20px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

/* Responsive Anpassung */
@media (min-width: 768px) {
  .game-card {
    max-width: 700px;
    width: 100%;
  }
}
</style>
