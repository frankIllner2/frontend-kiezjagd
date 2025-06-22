<template>
  <div class="game-question">
    <div v-if="question.answerquestion" class="answer-section">
      <div v-html="question.answerquestion"></div>
      <SpeechButton
        v-if="gameType === 'Mini'"
        :text="question.answerquestion"
      />
    </div>

    <hr style="border-width: 60%;">

    <p v-if="currentSalutation">
      {{ currentSalutation }} <span v-html=" question.question"></span>
      <SpeechButton v-if="gameType === 'Mini'" :text="fullQuestionText" />
    </p>
    <p v-else>
      <span v-html=" question.question"></span>
      <SpeechButton v-if="gameType === 'Mini'" :text="fullQuestionText" />
    </p>

    <!-- Frage mit Bild -->
    <div v-if="question.imageUrl" class="question-image">
      <img :src="getCorrectImageUrl(question.imageUrl)" alt="Frage Bild" />
    </div>

    <!-- Frage mit Sound -->
    <div v-if="question.audioUrl" class="question-audio">
      <audio :src="getCorrectImageUrl(question.audioUrl)" controls />
    </div>

    <!-- Freitextantwort -->
    <div v-if="question.type === 'text'" class="text-answer">
      <input v-model="userAnswer" placeholder="Deine Antwort" />
    </div>

    <!-- Einzelne Auswahl (vorher Mehrfachauswahl) -->
    <div v-else-if="question.type === 'multiple'" class="single-choice">
      <div
        v-for="(option, index) in question.options"
        :key="index"
        class="option-card"
        :class="{ selected: selectedOptions === index }"
        @click="toggleOption(index)"
      >
        <!-- Text -->
        <span v-if="option.type === 'text'" class="only-text">
          {{ option.text }}
          <SpeechButton v-if="gameType === 'Mini' && option.text" :text="option.text" />
        </span>

        <!-- Bild -->
        <span v-else-if="option.type === 'image'" class="option-image">
          <img :src="getCorrectImageUrl(option.imageUrl)" alt="Option Bild" />
        </span>

        <!-- Text + Bild -->
        <span v-else-if="option.type === 'both'" class="text-image">
          <img :src="getCorrectImageUrl(option.imageUrl)" alt="Option Bild" />
          <strong>{{ option.text }}</strong>
          <SpeechButton v-if="gameType === 'Mini' && option.text" :text="option.text" />
        </span>

        <!-- NEU: Nur Audio -->
        <span v-else-if="option.type === 'audio'" class="only-audio">
          <audio :src="option.audioUrl" controls />
        </span>

        <!-- Optional: Text + Audio -->
        <span v-else-if="option.type === 'text-audio'" class="text-audio">
          <strong>{{ option.text }}</strong>
          <audio :src="option.audioUrl" controls />
        </span>
      </div>
    </div>

      <!-- Standard-Antwort Button -->
      <button
        v-if="!['anweisung', 'next'].includes(question.type)"
        class="btn btn--secondary"
        @click="submitAnswer"
      >
        Antwort senden
      </button>

      <!-- Weiter-Button für "next" -->
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
  components: {
    SpeechButton
  },
  props: {
    question: Object,
    currentIndex: Number,
    playerNames: Array,
    gameType: String,
  },
  data() {
    return {
      userAnswer: "",
      selectedOptions: null,
      salutations: ["Hallo", "Hey"],
      players: [],
      currentSalutation: ""
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
    }
  },
  computed: {
    fullQuestionText() {
      return this.currentSalutation
        ? `${this.currentSalutation} ${this.question.question}`
        : this.question.question;
    }
  },
  methods: {
    loadPlayers() {
      const savedPlayers = localStorage.getItem("playerNames");
      if (this.isValidJsonArray(savedPlayers)) {
        this.players = JSON.parse(savedPlayers);
        console.log("✅ Spieler geladen:", this.players);
      } else if (Array.isArray(this.playerNames) && this.playerNames.length > 0) {
        // einmalige zufällige Rotation speichern
        const shuffled = this.shuffleArray([...this.playerNames]);
        this.players = shuffled;
        localStorage.setItem("playerNames", JSON.stringify(shuffled));
        console.log("🔀 Spieler zufällig gemischt:", shuffled);
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
      } catch (error) {
        return false;
      }
    },
    updateSalutation() {
      if (this.players.length > 1) {
        const playerIndex = this.currentIndex % this.players.length;
        const playerName = this.players[playerIndex];
        const salutation = this.salutations[this.currentIndex % this.salutations.length];
        this.currentSalutation = `${salutation} ${playerName}!`;
        console.log(`🎯 Frage ${this.currentIndex + 1}: ${this.currentSalutation}`);
      } else {
        this.currentSalutation = "";
      }
    },
    toggleOption(index) {
      this.selectedOptions = this.selectedOptions === index ? -1 : index;
    },
    submitAnswer() {
      let isCorrect = false;

      if (this.question.type === "text") {
        isCorrect =
          this.userAnswer.trim().toLowerCase() ===
          this.question.answer.toLowerCase();
      } else if (this.question.type === "multiple") {
        const correctIndex = this.question.options.findIndex(
          (option) => option.correct
        );
        isCorrect = this.selectedOptions === correctIndex;
      }

      this.$emit("submitAnswer", { isCorrect });
      this.userAnswer = "";
      this.selectedOptions = -1;
    },
    saveProgress(index) {
      localStorage.setItem("currentQuestionIndex", index);
      console.log(`📍 Fortschritt gespeichert: Frage ${index + 1}`);
    },
    getCorrectImageUrl(imageUrl) {
      return imageUrl.startsWith("http://localhost")
        ? imageUrl.replace("localhost", window.location.hostname)
        : imageUrl;
    }
  }
};
</script>