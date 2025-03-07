<template>
  <div class="game-question">
    <h3>Frage {{ currentIndex + 1 }}</h3>
    <p v-if="currentSalutation">{{ currentSalutation }} {{ question.question }}</p>
    <p v-else>{{ question.question }}</p>

    <!-- Frage mit Bild -->
    <div v-if="question.imageUrl" class="question-image">
      <img :src="getCorrectImageUrl(question.imageUrl)" alt="Frage Bild" />
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
        <span v-if="option.type === 'text'">{{ option.text }}</span>
        <span v-else-if="option.type === 'image'" class="option-image">
          <img :src="getCorrectImageUrl(option.imageUrl)" alt="Option Bild" />
        </span>
      </div>
    </div>
    <button class="btn btn--secondary" @click="submitAnswer">Antwort senden</button>
  </div>
</template>

<script>
export default {
  props: {
    question: Object,
    currentIndex: Number,
    playerNames: Array, // Spieler als Prop falls verfügbar
  },
  data() {
    return {
      userAnswer: '',
      selectedOptions: null,
      salutations: ["Hallo", "Hey", "Wie geht's", "Na", "Guten Tag", "Hi"],
      players: [], // Liste der Spielernamen
      currentSalutation: '', // Begrüßung + Name
    };
  },
  mounted() {
    this.loadPlayers();
    this.updateSalutation();

    const savedIndex = localStorage.getItem('currentQuestionIndex');
    if (savedIndex !== null) {
      this.$emit('updateIndex', parseInt(savedIndex, 10));
    }
  },
  watch: {
    currentIndex() {
      this.updateSalutation();
      this.saveProgress(this.currentIndex);
    },
  },
  methods: {
    loadPlayers() {
      const savedPlayers = localStorage.getItem('playerNames');
      if (this.isValidJsonArray(savedPlayers)) {
        this.players = JSON.parse(savedPlayers);
        console.log("✅ Spieler geladen:", this.players);
      } else {
        console.log("🔍 Falsche Daten im localStorage:", savedPlayers);
        localStorage.removeItem('playerNames'); 
        this.players = [];
      }
    },

    isValidJsonArray(data) {
      if (!data) return false;
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed); // Prüft, ob es wirklich ein Array ist
      } catch (error) {
        return false;
      }
    },
    updateSalutation() {
      if (this.players.length > 0) {
        const randomSalutation = this.salutations[Math.floor(Math.random() * this.salutations.length)];
        const randomPlayer = this.players[Math.floor(Math.random() * this.players.length)];
        this.currentSalutation = `${randomSalutation} ${randomPlayer},`;
      } else {
        this.currentSalutation = "Hallo,";
      }
    },
    toggleOption(index) {
      this.selectedOptions = this.selectedOptions === index ? -1 : index;
    },
    submitAnswer() {
      let isCorrect = false;

      if (this.question.type === 'text') {
        isCorrect = this.userAnswer.trim().toLowerCase() === this.question.answer.toLowerCase();
      } else if (this.question.type === 'multiple') {
        const correctIndex = this.question.options.findIndex(option => option.correct);
        isCorrect = this.selectedOptions === correctIndex;
      }
      console.log('submitAnswer', isCorrect);
      this.$emit('submitAnswer', { isCorrect });
      this.userAnswer = '';
      this.selectedOptions = -1; // Setzt die Auswahl zurück
    },
    saveProgress(index) {
      localStorage.setItem('currentQuestionIndex', index);
      console.log(`📍 Fortschritt gespeichert: Frage ${index + 1}`);
    },
    getCorrectImageUrl(imageUrl) {
      return imageUrl.startsWith('http://localhost')
        ? imageUrl.replace('localhost', window.location.hostname)
        : imageUrl;
    },
  },
};
</script>


