<template>
  <div class="game-container">
    <!-- Begrüßung und Spielname -->
    <div class="game-header">
      <h1>Willkommen bei Kiezjagd</h1>
      <h2 v-if="gameName">Spiel: {{ gameName }}</h2>
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
      <h3>Fragenrunde</h3>
      <GameTimer :gameDuration="gameDuration" />
      <GameQuestion
        v-if="currentQuestion"
        :question="currentQuestion"
        :currentIndex="currentQuestionIndex"
        @submitAnswer="handleAnswer"
      />

      <GpsChecker v-if="currentQuestion && currentQuestion.type === 'anweisung'" 
        :question="currentQuestion"
        :onSuccess="nextQuestion"
      />
      <p v-if="feedbackMessage" class="feedback">{{ feedbackMessage }}</p>
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
import StartForm from '@/components/StartForm.vue';
import GameQuestion from '@/components/GameQuestion.vue';
import GameTimer from '@/components/GameTimer.vue';
import GpsChecker from '@/components/GpsChecker.vue';
import { apiService } from '@/services/apiService';

export default {
  components: { StartForm, GameQuestion, GameTimer, GpsChecker },
  data() {
    return {
      gameId: null,
      gameName: '',
      teamName: '',
      email: '',
      playerCount: 1,
      playerNames: [],
      teamExists: false,
      questions: [],
      currentQuestionIndex: 0,
      gameStarted: false,
      gameFinished: false,
      gameDuration: '0h 0m 0s',
      feedbackMessage: '',
      timerInterval: null,
      startTime: null,
      endTime: null,
    };
  },
  name: 'GamePage',
  computed: {
    currentQuestion() {
      return this.questions.length > 0 && this.currentQuestionIndex < this.questions.length
        ? this.questions[this.currentQuestionIndex]
        : null;
    }
  },
  async mounted() {
    // Prüfe, ob ein gespeicherter Spielstatus vorhanden ist
    const savedGameId = localStorage.getItem('currentGameId');
    const gameInProgress = localStorage.getItem('gameInProgress') === 'true';
    const savedIndex = parseInt(localStorage.getItem(`currentQuestionIndex_${savedGameId}`), 10);

    if (gameInProgress && savedGameId) {
      // Wiederherstellung des gespeicherten Spiels
      this.gameId = savedGameId;
      this.teamName = localStorage.getItem('teamName') || '';
      this.email = localStorage.getItem('email') || '';
      this.currentQuestionIndex = savedIndex || 0;
      this.gameStarted = true;
      this.startTime = parseInt(localStorage.getItem('startTime'), 10) || Date.now();
      console.log(`📍 Wiederhergestelltes Spiel: ${this.gameId}, Startzeit: ${this.startTime}`);
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
        this.gameName = response.name || 'Unbekanntes Spiel';
        this.questions = response.questions || [];
        console.log('🔄 Spieldaten geladen:', response);
      } catch (error) {
        console.error('❌ Fehler beim Laden des Spiels:', error);
      }
    },
    startGame(payload) {
      this.startTimer();
      const { teamName, email, playerNames } = payload;

      if (!teamName || !email) {
        alert('⚠️ Bitte Teamname und E-Mail eingeben.');
        return;
      }

      this.teamName = teamName;
      this.email = email;
      this.playerNames = playerNames;
      this.startTime = Date.now();
      this.gameStarted = true;

      // Spielstatus in localStorage speichern
      localStorage.setItem('gameInProgress', 'true');
      localStorage.setItem('currentGameId', this.gameId);
      localStorage.setItem('teamName', teamName);
      localStorage.setItem('email', email);
      localStorage.setItem('startTime', this.startTime);
      localStorage.setItem('playerNames', JSON.stringify(playerNames));
    },
    handleAnswer({ isCorrect }) {
      if (isCorrect) {
        this.feedbackMessage = '✅ Antwort richtig!';
        setTimeout(() => {
          this.feedbackMessage = '';
          this.nextQuestion();
        }, 800);
      } else {
        this.feedbackMessage = '❌ Antwort falsch!';
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
      localStorage.setItem(`currentQuestionIndex_${this.gameId}`, this.currentQuestionIndex);
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

        console.log('📤 Ergebnis wird gesendet:', resultPayload);

        await apiService.saveGameResult(resultPayload);

        // Lokale Daten bereinigen
        localStorage.removeItem('teamName');
        localStorage.removeItem('email');
        localStorage.removeItem('gameInProgress');
        localStorage.removeItem('startTime');
        localStorage.removeItem(`currentQuestionIndex_${this.gameId}`);
      
      } catch (error) {
        console.error('❌ Fehler beim Speichern der Ergebnisse:', error);
        alert('❌ Fehler beim Speichern der Ergebnisse. Bitte versuche es erneut.');
      } finally {
        clearInterval(this.timerInterval);
      }
    },
    goToHome() {
      this.$router.push('/');
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
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  min-height: 100vh;
}

/* Header */
.game-header {
  text-align: center;
  margin-bottom: 20px;
}

.game-header h1 {
  font-size: 2rem;
  color: #4caf50;
  margin-bottom: 5px;
}

.game-header h2 {
  font-size: 1.2rem;
  color: #666;
}

/* Karten-Design */
.game-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 100%;
  max-width: 600px;
  text-align: center;
}

/* Startformular */
.start-form {
  text-align: left;
  margin-top: 20px;
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

/* Responsive Anpassung */
@media (min-width: 768px) {
  .game-card {
    max-width: 700px;
  }

  .game-header h1 {
    font-size: 2.5rem;
  }

  .game-header h2 {
    font-size: 1.4rem;
  }
}
</style>