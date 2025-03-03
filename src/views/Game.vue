<template>
  <div class="game-container">
    <!-- Begrüßung und Spielname -->
    <div class="game-header">
      <div class="img">
        <img src="@/assets/img/logo.png" />
      </div>
      <h2>Dein Abenteuer startet jetzt!</h2>
      <h3 v-if="gameName">Du spielst "{{ gameName }}"</h3>
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
      <GameTimer :gameDuration="gameDuration" />
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
      <!-- Feedback Overlay -->
      <div v-if="showFeedback" class="feedback-overlay">
        <div class="feedback-content">
          <p>{{ feedbackMessage }}</p>
          <img v-if="feedbackImage" :src="feedbackImage" alt="Antwort Feedback" />
        </div>
      </div>

    </div>

    <!-- Spielabschluss -->
    <div v-else class="game-card game-finished">
      <h3>🎉 Spiel erfolgreich abgeschlossen!</h3>
      <p><strong>Team:</strong> {{ teamName }}</p>
      <p><strong>E-Mail:</strong> {{ email }}</p>
      <p><strong>Zeit benötigt:</strong> {{ gameDuration }}</p>
      <p>Vielen Dank für's Spielen!</p>
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
      currentQuestionIndex: 0,
      gameStarted: false,
      gameFinished: false,
      gameDuration: "0h 0m 0s",
      showFeedback: false,
      feedbackMessage: "",
      timerInterval: null,
      startTime: null,
      endTime: null,
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
      const correctMessages = [
        "Toll! Du hast es geschafft! 🎉",
        "Antwort war 100% richtig! ✅",
        "Super gemacht! 👏",
        "Klasse! Weiter so! 💪",
        "Du bist ein Rätselmeister! 🏆"
      ];

      const incorrectMessages = [
        "Du bist der richtigen Antwort auf der Spur! 🔍",
        "Versuche es nochmal! Du schaffst das! 💡",
        "Knapp daneben ist auch vorbei! 😅",
        "Fast! Vielleicht hilft ein neuer Blickwinkel? 🔄",
        "Nicht ganz richtig – probiere es noch einmal! ⏳"
      ];

      if (isCorrect) {
        this.feedbackMessage = correctMessages[Math.floor(Math.random() * correctMessages.length)];
        this.feedbackImage = require('@/assets/img/correct.gif'); // Pfad zum GIF für richtige Antwort
        this.showFeedback = true;

        // Nach 7 Sekunden zur nächsten Frage weitergehen
        setTimeout(() => {
          this.showFeedback = false;
          this.feedbackMessage = "";
          this.feedbackImage = null;
          this.nextQuestion(); // Nur wenn die Antwort richtig war!
        }, 7000);
      } else {
        this.feedbackMessage = incorrectMessages[Math.floor(Math.random() * incorrectMessages.length)];
        this.feedbackImage = require('@/assets/img/icons/hand.png'); // Pfad zum Bild für falsche Antwort
        this.showFeedback = true;

        // Nach 7 Sekunden nur das Overlay ausblenden, aber keine neue Frage laden
        setTimeout(() => {
          this.showFeedback = false;
          this.feedbackMessage = "";
          this.feedbackImage = null;
        }, 7000);
      }
    },

    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        this.saveQuestionIndex();
      } else {
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
          startTime: new Date(this.startTime).toISOString(),
          endTime: new Date(this.endTime).toISOString(),
          duration: formattedDuration,
        };

        console.log("📤 Ergebnis wird gesendet:", resultPayload);

        await apiService.saveGameResult(resultPayload);

        // Lokale Daten bereinigen
        localStorage.removeItem("teamName");
        localStorage.removeItem("email");
        localStorage.removeItem("gameInProgress");
        localStorage.removeItem("startTime");
        localStorage.removeItem(`currentQuestionIndex_${this.gameId}`);
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
  color: #355b4c;
  font-size: 5vw;
  font-weight: bold;
  text-align: center;
  p {
    padding: 0 3em;
  }
}

.feedback-content img {
  margin-top: 20px;
  max-height: 80vh;
}



/* Responsive Anpassung */
@media (min-width: 768px) {
  .game-card {
    max-width: 700px;
        width: 100%;
  }


}
</style>
