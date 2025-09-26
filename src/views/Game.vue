<template>
  <div class="game-container">
    <!-- Begrüßung und Spielname -->
    <div class="game-header">
      <div v-if="!this.gameStarted" class="img">
        <img src="@/assets/img/logo.png" />
      </div>
      <h2 v-if="!this.gameStarted">Dein Abenteuer startet jetzt!</h2>
      <h3 v-if="!this.gameStarted && !gameFinished">Du spielst "{{ gameName }}"</h3>
    </div>
    <div v-if="!gameStarted" class="game-card-prehistory">
      <div v-if="prehistory" class="card content-prehistory">
        <h4>Die Geschichte zum Spiel</h4>

        <!-- Text wird als HTML angezeigt -->
        <div v-html="prehistory"></div>

        <!-- Sprachausgabe für Mini-Spieltyp -->
        <SpeechButton v-if="gameType === 'Mini' || gameType === 'Medi'" :text="prehistory" />

        <button @click="openForm" class="btn btn--primary">Los geht’s!</button>
      </div>
    </div>

    <!-- Startformular bleibt vollständig -->
    <div v-if="!gameStarted" class="game-card start-form">
      <transition name="slide-up">
        <div v-show="showStartForm" class="form-inner">
          <button class="close-button" @click="closeForm">×</button>
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
      </transition>
    </div>

    <!-- Fragenbereich -->
    <div v-else-if="!gameFinished" class="game-card question-section">
      <transition name="fade-question" mode="out-in">
        <component
          :is="
            currentQuestion && currentQuestion.type === 'anweisung'
              ? 'GpsChecker'
              : 'GameQuestion'
          "
          v-if="currentQuestion"
          :key="currentQuestionIndex"
          :question="currentQuestion"
          :currentIndex="currentQuestionIndex"
          :gameType="gameType"
          :onSuccess="nextQuestion"
          :feedbackMessage="feedbackMessage"
          @submitAnswer="handleAnswer"
        />
      </transition>

      <FeedbackAnimation
        v-if="showFeedback && currentQuestion?.type !== 'next'"
        ref="feedbackAnimation"
        :showFeedback="showFeedback"
        :feedbackImage="feedbackImage"
        :feedbackMessage="feedbackMessage"
        :feedbackMessage2="feedbackMessage2"
        :earnedStars="earnedStars"
        :gameType="gameType"
        @startCounting="startCounting"
        @done="handleAnimationDone"
      />

      <TimeBonusAnimation
        v-if="currentQuestion?.type !== 'next'"
        ref="timeBonusAnimation"
        :gameType="gameType"
        @applyBonus="applyTimeBonus"
        @done="onTimeBonusDone"
      />

      <div class="star-status" v-if="currentQuestion?.type !== 'next'">
        <p v-if="gameType === 'Maxi'" :class="{ 'time-bonus-glow': showTimeGlow }">
          <span>Zeit benötigt:</span>
          <strong>{{ gameDuration }}</strong>
        </p>
        <p v-else><strong>Gesammelte Sterne:</strong> 🌟 {{ starCount }}</p>
      </div>
    </div>

    <!-- Spielabschluss -->
    <div v-else class="game-card game-finished">
      <div class="result-container">
        <div class="result">
          <div v-if="infohistory" class="info-container">
            <div v-html="infohistory"></div>
            <SpeechButton v-if="gameType === 'Mini' || gameType === 'Medi'" :text="infohistory" />
          </div>
          <h3>Spiel erfolgreich abgeschlossen!</h3>
          <div class="result-content">
            <div>
              <p>
                <strong>Team:{{ teamName }}</strong>
              </p>
              <p v-if="gameType === 'Maxi'">
                <strong>Zeit benötigt:</strong> {{ gameDuration }}
              </p>
              <p v-else>
                <strong>Gesammelte Sterne: 🌟 {{ starCount }}</strong>
              </p>
            </div>
            <div>
              <p>
                Hat dir das Spiel gefallen und hast du ein paar Anmerkungen - dann schreib
                uns!
              </p>
              <p><a href="mailto:mail@kiezjagd.de">Team Kiezjagd</a></p>
              <br />
              <!-- Social Media (Desktop) -->
              <div class="social-icons">
                <p>Oder folge uns auf Insta - für weitere Rätsel und Informationen!</p>
                <a href="https://www.instagram.com/kiezjagd/" target="_blank">
                  <font-awesome-icon
                    :icon="['fab', 'instagram']"
                    class="social-icon instagram"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="info-container">
          <button @click="goToHome" class="btn btn--primary">
            Zurück zur Startseite
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StartForm from "@/components/StartForm.vue";
import GameQuestion from "@/components/GameQuestion.vue";
import GpsChecker from "@/components/GpsChecker.vue";
import FeedbackAnimation from "@/components/FeedbackAnimation.vue";
import { apiService } from "@/services/apiService";
import TimeBonusAnimation from "@/components/TimeBonusAnimation.vue";
import SpeechButton from "@/components/SpeechButton.vue";

export default {
  components: {
    StartForm,
    GameQuestion,
    GpsChecker,
    FeedbackAnimation,
    TimeBonusAnimation,
    SpeechButton,
  },
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
      currentAnswerQuestion: "",
      currentQuestionIndex: 0,
      gameStarted: false,
      gameFinished: false,
      gameDuration: "0h 0m 0s",
      showFeedback: false,
      feedbackMessage: "",
      feedbackMessage2: "",
      prehistory: "",
      infohistory: "",
      landingPageUrl: "",
      timerInterval: null,
      startTime: null,
      endTime: null,
      feedbackImage: null,
      starCount: 0,
      earnedStars: 0,
      attemptCount: 0,
      gameType: "",
      showTimeGlow: false,
      showStartForm: false,
      correctSound: null,
      correctSounds: [],
      lastCorrectSoundIndex: null,
    };
  },
  computed: {
    currentQuestion() {
      return this.questions.length > 0 &&
        this.currentQuestionIndex < this.questions.length
        ? this.questions[this.currentQuestionIndex]
        : null;
    },
  },
  async mounted() {
    // Prüfe, ob der Nutzer über einen neuen Spiel-Link kommt
    const currentUrlGameId = this.$route.params.gameId || this.$route.params.encryptedId;
    const savedGameId = localStorage.getItem("currentGameId");

    if (currentUrlGameId && currentUrlGameId !== savedGameId) {
      console.log("🆕 Neuer Spiel-Link erkannt. Lösche den Spielstand.");
      localStorage.clear();
    }

    const gameInProgress = localStorage.getItem("gameInProgress") === "true";
    const savedIndex = parseInt(
      localStorage.getItem(`currentQuestionIndex_${savedGameId}`),
      10
    );

    if (gameInProgress && savedGameId) {
      this.gameId = savedGameId;
      this.teamName = localStorage.getItem("teamName") || "";
      this.email = localStorage.getItem("email") || "";
      this.currentQuestionIndex = savedIndex || 0;
      this.gameStarted = true;
      this.starCount = parseInt(localStorage.getItem("starCount"), 10) || 0;
      this.startTime = parseInt(localStorage.getItem("startTime"), 10) || Date.now();
      console.log(
        `Wiederhergestelltes Spiel: ${this.gameId}, Startzeit: ${this.startTime}`
      );
      this.startTimer();
    } else {
      this.gameId = currentUrlGameId;
    }

    if (!this.gameId) {
      console.error("⚠️ Fehler: gameId ist nicht vorhanden!");
      return;
    }

    await this.loadGameData(this.gameId);

    // ✅ Korrekt-Sounds vorladen
    this.correctSounds = ["sound-julia-2.mp3", "correct.flac", "sound-julia-3.mp3"].map((file) => {
      const a = new Audio(require(`@/assets/sound/${file}`));
      a.preload = "auto";
      a.volume = 1.0; // ggf. 0.8
      return a;
    });


  },
  name: "GamePage",
  methods: {
    async loadGameData(gameId) {
      try {
        const response = await apiService.fetchGameById(gameId);
        this.gameName = response.name || "Unbekanntes Spiel";
        this.questions = response.questions || [];
        this.gameType = response.ageGroup || "Maxi";
        this.prehistory = response.prehistory || "";
        this.infohistory = response.infohistory || "";
        this.landingPageUrl = response.landingPageUrl || "";
        console.log("Game - Spieldaten geladen:");
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
      this.showStartForm = false;
      this.gameStarted = true;

      localStorage.setItem("gameInProgress", "true");
      localStorage.setItem("currentGameId", this.gameId);
      localStorage.setItem("teamName", teamName);
      localStorage.setItem("email", email);
      localStorage.setItem("startTime", this.startTime);
      localStorage.setItem("playerNames", JSON.stringify(playerNames));
    },
    handleAnswer({ isCorrect }) {
      this.currentAnswerQuestion = this.currentQuestion;

      if (this.currentAnswerQuestion.type === "next") {
        this.nextQuestion();
        return;
      }

      if (isCorrect) {
        this.earnedStars = this.calculateStars();
        this.feedbackMessage = '';
        this.feedbackMessage2 = '';

        // ✅ Random Correct-GIF
        const correctGifs = [
          require("@/assets/img/fritz-correct.gif"),
          require("@/assets/img/frida-correct.gif")
        ];
        this.feedbackImage =
          correctGifs[Math.floor(Math.random() * correctGifs.length)];

        this.showFeedback = true;

        this.playRandomCorrectSound();

        if (this.gameType === "Maxi") {
          const bonus = this.getTimeBonus();
          if (bonus > 0) {
            setTimeout(() => {
              this.$refs.timeBonusAnimation.startTimeBonusAnimation(bonus);
            }, 1000);

            setTimeout(() => {
              this.showFeedback = false;
            }, 6000);
          } else {
            setTimeout(() => {
              this.showFeedback = false;
              this.nextQuestion();
            }, 6000);
          }
        } else {
          setTimeout(() => {
            if (this.earnedStars > 0) {
              this.$refs.feedbackAnimation.start(this.earnedStars);
            }
          }, 1000);

          setTimeout(() => {
            this.showFeedback = false;
          }, 8000);
        }
      } else {
        this.earnedStars = 0;
        this.attemptCount++;
        this.feedbackMessage = "Du bist auf der richtigen Spur!";
        this.feedbackMessage2 = "Versuch es noch einmal!";

        // ❌ Random False-Bild
        const falseImages = [
          require("@/assets/img/frida-false.png"),
          require("@/assets/img/fritz-false.png"),
          require("@/assets/img/lupe-false.png")
        ];
        this.feedbackImage =
          falseImages[Math.floor(Math.random() * falseImages.length)];

        this.showFeedback = true;

        setTimeout(() => {
          this.showFeedback = false;
        }, 5000);
      }
    },
    playRandomCorrectSound() {
      if (!this.correctSounds || this.correctSounds.length === 0) return;

      // Nicht denselben Clip zweimal hintereinander
      let idx;
      do {
        idx = Math.floor(Math.random() * this.correctSounds.length);
      } while (this.correctSounds.length > 1 && idx === this.lastCorrectSoundIndex);

      // Alle stoppen/zurücksetzen, falls etwas noch spielt
      this.correctSounds.forEach(a => {
        try { a.pause(); a.currentTime = 0; } catch (_) {
          // ignore
        }
      });

      const clip = this.correctSounds[idx];
      this.lastCorrectSoundIndex = idx;

      // iOS/Safari: play() kann ein Promise sein
      const p = clip.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Falls Autoplay blockiert: ignorieren oder leise fallbacken
          // (hier kein extra Handling nötig, da durch User-Interaktion ausgelöst)
        });
      }
    },
    getTimeBonus() {
      if (this.attemptCount === 0) return 60;
      if (this.attemptCount === 1) return 30;
      if (this.attemptCount === 2) return 10;
      return 0;
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
      console.log("🎬 Animation beendet, starte Hochzählen...");

      let currentStars = this.starCount;
      let targetStars = this.starCount + this.earnedStars;

      if (!this.countingStarted) {
        this.countingStarted = true; // Verhindert mehrfaches Starten

        const interval = setInterval(() => {
          if (currentStars < targetStars) {
            currentStars++;
            this.starCount = currentStars;
            localStorage.setItem("starCount", this.starCount);
          } else {
            clearInterval(interval);
            this.countingStarted = false; // Zurücksetzen für nächste Animation
            console.log("🎯 Zählen abgeschlossen, wechsle zur nächsten Frage.");
            setTimeout(() => {
              this.nextQuestion(); // ✅ Wechsle zur nächsten Frage nach kurzem Delay
            }, 500);
          }
        }, 300); // Geschwindigkeit des Hochzählens
      }
    },
    onTimeBonusDone() {
      console.log("🕒 Zeitbonus-Animation beendet.");
      this.showFeedback = false;
      this.nextQuestion();
    },
    startCounting() {
      if (this.countingStarted) return; // 🚀 Blockiert doppeltes Hochzählen
      this.countingStarted = true; // ✅ Markiert als gestartet

      let currentStars = this.starCount;
      let targetStars = this.starCount + this.earnedStars;

      const interval = setInterval(() => {
        if (currentStars < targetStars) {
          currentStars++;
          this.starCount = currentStars;
          localStorage.setItem("starCount", this.starCount);
        } else {
          clearInterval(interval);
          this.countingStarted = false; // 🔄 Zurücksetzen für die nächste Frage
          console.log("🎯 Zählen abgeschlossen.");
          setTimeout(() => {
            this.nextQuestion(); // ✅ Wechsle zur nächsten Frage nach kurzem Delay
          }, 500);
        }
      }, 1000);
    },
    applyTimeBonus(bonus) {
      const elapsed = Date.now() - this.startTime; // vergangene Zeit in ms
      const bonusMs = bonus * 1000;
      const actualBonus = Math.min(elapsed, bonusMs); // maximal bis 0 zurück

      this.startTime += actualBonus; // Startzeit nach vorne schieben
      this.showTimeGlow = true;
      setTimeout(() => {
        this.showTimeGlow = false;
      }, 1500);
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

        let elapsedTime = (currentTime - this.startTime) / 1000;
        if (elapsedTime < 0) elapsedTime = 0; // ⛔ verhindert negative Anzeige
        elapsedTime = Math.round(elapsedTime);

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
          landingPageUrl: this.landingPageUrl,
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

        localStorage.removeItem("teamName");
        localStorage.removeItem("email");
        localStorage.removeItem("gameInProgress");
        localStorage.removeItem("startTime");
        localStorage.removeItem(`currentQuestionIndex_${this.gameId}`);
        localStorage.removeItem("starCount");
        localStorage.removeItem("playerNames");
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
    openForm() {
      this.showStartForm = true;
    },
    closeForm() {
      this.showStartForm = false;
    },
  },
  beforeUnmount() {
    clearInterval(this.timerInterval);
    if (this.correctSounds && this.correctSounds.length) {
      this.correctSounds.forEach(a => { try { a.pause(); } catch(_) {
        // ignore
      } });
    }
  },
};
</script>

<style scoped>
/* Allgemeine Spielcontainer-Stile */
.fade-question-enter-active,
.fade-question-leave-active {
  transition: opacity 0.5s ease;
}
.fade-question-enter-from,
.fade-question-leave-to {
  opacity: 0;
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
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
.game-card-prehistory {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
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

.game-finished p {
  margin: 5px 0;
  font-size: 1rem;
  color: #333;
}

/* Fixierte Sterne-Anzeige unten */
.star-status {
  position: fixed;
  width: 100%;
  top: 0;
  right: 0;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  color: #fac227;
  z-index: 10; /* Sicherstellen, dass es unter dem Button bleibt */
  pointer-events: none; /* Verhindert, dass es Klicks blockiert */
  background-color: #355b4c;
  padding: 10px 15px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  z-index: 20001;
}

.star-status p {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.star-status img {
  max-width: 100%;
  width: 30px;
}

.btn-primary:hover {
  background-color: #388e3c;
}
.hidden {
  display: none;
}

.time-bonus-glow {
  animation: glow-pulse 1s ease-out;
  color: #f9f9f9;
  font-weight: bold;
}

@keyframes glow-pulse {
  0% {
    text-shadow: 0 0 0 rgba(250, 194, 39, 0);
    transform: scale(1);
  }
  25% {
    text-shadow: 0 0 12px rgba(250, 194, 39, 0.9);
    transform: scale(1.1);
  }
  50% {
    text-shadow: 0 0 0 rgba(250, 194, 39, 0);
    transform: scale(1);
  }
  75% {
    text-shadow: 0 0 12px rgba(250, 194, 39, 0.9);
    transform: scale(1.1);
  }
  100% {
    text-shadow: 0 0 0 rgba(250, 194, 39, 0);
    transform: scale(1);
  }
}
/* Overlay-Zustände */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s ease, opacity 0.4s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.form-inner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #f4ebd0;
  padding: 1rem;
  z-index: 1000; /* wichtig: höher als alles darunter */
}

.close-button {
  position: absolute;
  right: 1rem;
  top: 1rem;
  font-size: 1.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
}

/* Responsive Anpassung */
@media (min-width: 768px) {
  .game-card {
    max-width: 700px;
    width: 100%;
  }
}
</style>
