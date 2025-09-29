<template>
  <div class="game-question">
    <div v-if="question.answerquestion" class="answer-section">
      <div v-html="question.answerquestion"></div>
      <SpeechButton
        v-if="gameType === 'Mini'  || gameType === 'Medi'"
        :text="question.answerquestion"
      />
    </div>

    <hr style="border-width: 60%;">

    <p v-if="currentSalutation">
      {{ currentSalutation }} <span v-html="question.question"></span>
      <SpeechButton v-if="gameType === 'Mini' || gameType === 'Medi'" :text="fullQuestionText" />
    </p>
    <p v-else>
      <span v-html="question.question"></span>
      <SpeechButton v-if="gameType === 'Mini' || gameType === 'Medi'" :text="fullQuestionText" />
    </p>

    <!-- Bild -->
    <div v-if="question.imageUrl" class="question-image">
      <img :src="getCorrectImageUrl(question.imageUrl)" alt="Frage Bild" />
    </div>

    <!-- Audio -->
    <div v-if="question.audioUrl" class="question-audio">
      <audio :src="getCorrectImageUrl(question.audioUrl)" controls />
    </div>

    <!-- Freitext -->
    <div v-if="question.type === 'text'" class="text-answer">
      <input
        v-model="userAnswerProxy"
        maxlength="35"
        name="Antwort"
        placeholder="Deine Antwort"
        :disabled="locked"
        :readonly="locked"
        aria-label="Freitext-Antwort"
      />
    </div>

    <!-- Single Choice -->
    <div v-else-if="question.type === 'multiple'" class="single-choice" :class="{ locked: locked }">
      <div
        v-for="(option, index) in question.options"
          :key="index"
          class="option-card"
          :class="{ selected: selectedOptions === index }"
          @click="onOptionClick(index)" 
          role="button"
          :tabindex="locked ? -1 : 0"
          @keyup.enter="onOptionEnter(index)"
          :aria-disabled="locked"
        >
        <!-- Text -->
        <span v-if="option.type === 'text'" class="only-text">
          {{ option.text }}
          <SpeechButton v-if="(gameType === 'Mini'  || gameType === 'Medi') && option.text" :text="option.text" @click.stop />
        </span>

        <!-- Bild -->
        <span v-else-if="option.type === 'image'" class="option-image">
          <img :src="getCorrectImageUrl(option.imageUrl)" alt="Option Bild" />
        </span>

        <!-- Text + Bild -->
        <span v-else-if="option.type === 'both'" class="text-image">
          <img :src="getCorrectImageUrl(option.imageUrl)" alt="Option Bild" />
          <strong>{{ option.text }}</strong>
          <SpeechButton v-if="(gameType === 'Mini' || gameType === 'Medi') && option.text" :text="option.text" />
        </span>

        <!-- Nur Audio -->
        <span v-else-if="option.type === 'audio'" class="only-audio">
          <audio :src="option.audioUrl" controls />
        </span>

        <!-- Text + Audio -->
        <span v-else-if="option.type === 'text-audio'" class="text-audio">
          <strong>{{ option.text }}</strong>
          <audio :src="option.audioUrl" controls />
        </span>
      </div>
    </div>

    <!-- Hinweise -->
    <p v-if="locked" class="form-hint">Frühere Frage – nur ansehen, Antwort ist gesperrt.</p>
    <p v-else-if="attemptedSubmit && !isAnswerReady" class="form-hint form-hint--error">
      Du hast noch keine Antwort ausgewählt.
    </p>

    <!-- Senden -->
    <button
      v-if="!['anweisung', 'next'].includes(question.type)"
      class="btn btn--secondary"
      :disabled="locked || !isAnswerReady"
      :aria-disabled="locked || !isAnswerReady"
      @click="submitAnswer"
    >
      Antwort senden
    </button>

    <!-- Weiter (Typ next) -->
    <button
      v-else-if="question.type === 'next'"
      class="btn btn--primary"
      @click="$emit('submitAnswer', { isCorrect: true })"
    >
      Weiter
    </button>
  </div>
</template>

<script>
import SpeechButton from "./SpeechButton.vue";

export default {
  components: { SpeechButton },
  props: {
    question: Object,
    currentIndex: Number,
    playerNames: Array,
    gameType: String,
    locked: { type: Boolean, default: false }
  },
  data() {
    return {
      userAnswer: "",
      selectedOptions: -1, // -1 = nichts gewählt
      salutations: ["Hallo", "Hey"],
      players: [],
      currentSalutation: "",
      attemptedSubmit: false
    };
  },
  mounted() {
    this.loadPlayers();
    this.updateSalutation();

    const savedIndex = localStorage.getItem("currentQuestionIndex");
    if (savedIndex !== null) {
      this.$emit("updateIndex", parseInt(savedIndex, 10));
    }
  },
  watch: {
    currentIndex() {
      this.updateSalutation();
      this.saveProgress(this.currentIndex);
      // Reset lokale Eingaben beim Fragewechsel
      this.userAnswer = "";
      this.selectedOptions = -1;
      this.attemptedSubmit = false;
    },
    // Falls der Modus auf "locked" wechselt → alles zurücksetzen
    locked(newVal) {
      if (newVal) {
        this.userAnswer = "";
        this.selectedOptions = -1;
        this.attemptedSubmit = false;
      }
    }
  },
  computed: {
    fullQuestionText() {
      return this.currentSalutation
        ? `${this.currentSalutation} ${this.question.question}`
        : this.question.question;
    },
    // v-model-Proxy, der im Lesemodus NICHT zurückschreibt
    userAnswerProxy: {
      get() {
        return this.userAnswer;
      },
      set(val) {
        if (this.locked) return; // blockt Tipp-Eingaben hart
        this.userAnswer = val;
      }
    },
    // prüft, ob Antwort bereit ist
    isAnswerReady() {
      if (this.locked) return false; // Lesemodus sperrt immer
      if (this.question.type === "text") {
        return this.userAnswer.trim().length > 0;
      }
      if (this.question.type === "multiple") {
        return this.selectedOptions !== -1 && this.selectedOptions !== null;
      }
      return true;
    }
  },
  methods: {
    loadPlayers() {
      const savedPlayers = localStorage.getItem("playerNames");
      if (this.isValidJsonArray(savedPlayers)) {
        this.players = JSON.parse(savedPlayers);
      } else if (Array.isArray(this.playerNames) && this.playerNames.length > 0) {
        const shuffled = this.shuffleArray([...this.playerNames]);
        this.players = shuffled;
        localStorage.setItem("playerNames", JSON.stringify(shuffled));
      } else {
        this.players = [];
      }
    },
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
    isValidJsonArray(data) {
      if (!data) return false;
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed);
      } catch {
        return false;
      }
    },
    updateSalutation() {
      if (this.players.length > 1) {
        const playerIndex = this.currentIndex % this.players.length;
        const playerName = this.players[playerIndex];
        const salutation = this.salutations[this.currentIndex % this.salutations.length];
        this.currentSalutation = `${salutation} ${playerName}!`;
      } else {
        this.currentSalutation = "";
      }
    },
    onOptionClick(index) {
      if (this.locked) return;
      this.toggleOption(index);
    },
    onOptionEnter(index) {
      if (this.locked) return;
      this.toggleOption(index);
    },
    toggleOption(index) {
      this.selectedOptions = this.selectedOptions === index ? -1 : index;
      if (this.selectedOptions !== -1) this.attemptedSubmit = false;
    },
    submitAnswer() {
      if (this.locked) return; // Lesemodus blockt
      if (!this.isAnswerReady) {
        this.attemptedSubmit = true;
        return;
      }

      let isCorrect = false;
      if (this.question.type === "text") {
        isCorrect =
          this.userAnswer.trim().toLowerCase() ===
          String(this.question.answer || "").toLowerCase();
      } else if (this.question.type === "multiple") {
        const correctIndex = this.question.options.findIndex(
          (option) => option.correct
        );
        isCorrect = this.selectedOptions === correctIndex;
      }

      this.$emit("submitAnswer", { isCorrect });
      this.userAnswer = "";
      this.selectedOptions = -1;
      this.attemptedSubmit = false;
    },
    saveProgress(index) {
      localStorage.setItem("currentQuestionIndex", index);
    },
    getCorrectImageUrl(url) {
      return url && url.startsWith("http://localhost")
        ? url.replace("localhost", window.location.hostname)
        : url;
    }
  }
};
</script>

<style scoped>
.form-hint { margin: .75rem 0 0; font-size: 0.95rem; }
.form-hint--error { color: #b00020; }

.option-card.selected { outline: 2px solid currentColor; }
button[disabled] { opacity: .5; cursor: not-allowed; }

/* 🔒 Lesemodus-Optik und Interaktion */
.option-card.is-locked {
  cursor: not-allowed;
  opacity: .7;
}
/* Sperrt alle Klicks auf Optionen, wenn locked */
.single-choice.locked .option-card {
  pointer-events: none;
  opacity: .7;
  cursor: not-allowed;
}

/* Aber: Vorlesen-Button darf trotzdem klickbar sein */
.single-choice.locked .speech-btn {
  pointer-events: auto;
  cursor: pointer;
}

</style>
