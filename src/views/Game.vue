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

      <FeedbackAnimation
        ref="feedbackAnimation"
        :showFeedback="showFeedback"
        :feedbackMessage="feedbackMessage"
        :feedbackImage="feedbackImage"
        :earnedStars="earnedStars"
        :gameType="gameType"
        @done="handleAnimationDone"
      />

      <div class="star-status">
        <p v-if="gameType === 'Maxi'">
          <strong>Zeit benötigt:</strong> {{ gameDuration }}
        </p>
        <p v-else><strong>Gesammelte Sterne:</strong> 🌟 {{ starCount }}</p>
      </div>
    </div>

    <!-- Spielabschluss -->
    <div v-else class="game-card game-finished">
      <div class="result-container">
        <div class="card">
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
        <button @click="goToHome" class="btn btn--primary">Zurück zur Startseite</button>
      </div>
      </div>
    </div>
  </div>
</template>

<script>
import StartForm from '@/components/StartForm.vue';
import GameQuestion from '@/components/GameQuestion.vue';
import GameTimer from '@/components/GameTimer.vue';
import GpsChecker from '@/components/GpsChecker.vue';
import FeedbackAnimation from '@/components/FeedbackAnimation.vue';
import { apiService } from '@/services/apiService';

export default {
  components: { StartForm, GameQuestion, GameTimer, GpsChecker, FeedbackAnimation },
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
      currentAnswerQuestion: '',
      currentQuestionIndex: 0,
      gameStarted: false,
      gameFinished: false,
      gameDuration: '0h 0m 0s',
      showFeedback: false,
      feedbackMessage: '',
      timerInterval: null,
      startTime: null,
      endTime: null,
      feedbackImage: null,
      starCount: 0,
      earnedStars: 0,
      attemptCount: 0,
      gameType: '',
    };
  },
  computed: {
    currentQuestion() {
      return this.questions.length > 0 && this.currentQuestionIndex < this.questions.length
        ? this.questions[this.currentQuestionIndex]
        : null;
    },
  },
  async mounted() {
    const savedGameId = localStorage.getItem('currentGameId');
    const gameInProgress = localStorage.getItem('gameInProgress') === 'true';
    const savedIndex = parseInt(localStorage.getItem(`currentQuestionIndex_${savedGameId}`), 10);

    if (gameInProgress && savedGameId) {
      this.gameId = savedGameId;
      this.teamName = localStorage.getItem('teamName') || '';
      this.email = localStorage.getItem('email') || '';
      this.currentQuestionIndex = savedIndex || 0;
      this.gameStarted = true;
      this.starCount = parseInt(localStorage.getItem('starCount'), 10) || 0;
      this.startTime = parseInt(localStorage.getItem('startTime'), 10) || Date.now();
      console.log(`📍 Wiederhergestelltes Spiel: ${this.gameId}, Startzeit: ${this.startTime}`);
      this.startTimer();
    } else {
      this.gameId = this.$route.params.gameId || null;
    }

    this.gameId = this.$route.params.gameId || this.$route.params.encryptedId;

    if (!this.gameId) {
      console.error('⚠️ Fehler: gameId ist nicht vorhanden!');
      return;
    }

    if (this.gameId) {
      await this.loadGameData(this.gameId);
    }
  },
  name: 'GamePage',
  methods: {
    async loadGameData(gameId) {
      try {
        const response = await apiService.fetchGameById(gameId);
        this.gameName = response.name || 'Unbekanntes Spiel';
        this.questions = response.questions || [];
        this.gameType = response.ageGroup || 'Maxi';
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

      localStorage.setItem('gameInProgress', 'true');
      localStorage.setItem('currentGameId', this.gameId);
      localStorage.setItem('teamName', teamName);
      localStorage.setItem('email', email);
      localStorage.setItem('startTime', this.startTime);
      localStorage.setItem('playerNames', JSON.stringify(playerNames));
    },
    handleAnswer({ isCorrect }) {
      this.currentAnswerQuestion = this.currentQuestion;
      this.earnedStars = this.calculateStars();

      if (isCorrect) {
        this.feedbackMessage = this.currentAnswerQuestion.answerquestion;
        this.feedbackImage = require('@/assets/img/correct.gif');

        // Setze einen Timer, um das Feedback auszublenden und die Animation zu starten
        if (this.gameType !== 'Maxi') {
          setTimeout(() => {
            this.showFeedback = false; // Feedback ausblenden
            this.$nextTick(() => {
              this.$refs.feedbackAnimation.start();
            });
          }, 5000);
        } else {
          this.handleAnimationDone(); // Direkter Übergang zur nächsten Frage bei Maxi
        }
      } else {
        this.attemptCount++;
        this.feedbackMessage = 'Versuche es nochmal!';
        this.feedbackImage = require('@/assets/img/false.png');
        this.showFeedback = true;
        setTimeout(() => {
          this.showFeedback = false; //Feedback entfernen
        }, 5000);
      }
       this.showFeedback = true;
    },
    calculateStars() {
      if (this.attemptCount === 0) return 5;
      if (this.attemptCount === 1) return 3;
      return 1;
    },
    nextQuestion() {
      this.attemptCount = 0;
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        this.saveQuestionIndex();
      } else {
        this.finishGame();
      }
    },
    handleAnimationDone() {
      this.starCount = this.starCount + this.earnedStars; // verdiente Sterne hinzufügen
      localStorage.setItem('starCount', this.starCount);
      this.nextQuestion(); // nach Animation zur nächsten Frage
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
          gameType: this.gameType,
          gameName: this.gameName,
          startTime: new Date(this.startTime).toISOString(),
          endTime: new Date(this.endTime).toISOString(),
          duration: formattedDuration,
          stars: this.starCount,
        };

        console.log('📤 Ergebnis wird gesendet:', resultPayload);
        await apiService.saveGameResult(resultPayload);

        localStorage.removeItem('teamName');
        localStorage.removeItem('email');
        localStorage.removeItem('gameInProgress');
        localStorage.removeItem('startTime');
        localStorage.removeItem(`currentQuestionIndex_${this.gameId}`);
        localStorage.removeItem('starCount');
        localStorage.removeItem('playerNames');

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


.btn-primary:hover {
  background-color: #388e3c;
}
.hidden {
  display: none;
}

/* Responsive Anpassung */
@media (min-width: 768px) {
  .game-card {
    max-width: 700px;
    width: 100%;
  }
}
</style>
