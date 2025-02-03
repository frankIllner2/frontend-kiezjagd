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
      <button @click="submitAnswer">Antwort senden</button>
    </div>

    <!-- Mehrfachauswahl -->
    <div v-else-if="question.type === 'multiple'" class="multiple-choice">
      <div
        v-for="(option, index) in question.options"
        :key="index"
        class="option-card"
        :class="{ selected: selectedOptions.includes(index) }"
        @click="toggleOption(index)"
      >
        <span v-if="option.type === 'text'">{{ option.text }}</span>
        <span v-else-if="option.type === 'image'" class="option-image">
          <img :src="getCorrectImageUrl(option.imageUrl)" alt="Option Bild" />
        </span>
      </div>
      <button @click="submitAnswer">Antwort senden</button>
    </div>
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
      selectedOptions: [],
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
      if (this.selectedOptions.includes(index)) {
        this.selectedOptions = this.selectedOptions.filter(i => i !== index);
      } else {
        this.selectedOptions.push(index);
      }
    },
    submitAnswer() {
      let isCorrect = false;

      if (this.question.type === 'text') {
        isCorrect = this.userAnswer.trim().toLowerCase() === this.question.answer.toLowerCase();
      } else if (this.question.type === 'multiple') {
        const correctIndexes = this.question.options
          .map((option, index) => (option.correct ? index : null))
          .filter(index => index !== null);

        isCorrect = JSON.stringify(correctIndexes.sort()) === JSON.stringify(this.selectedOptions.sort());
      }

      this.$emit('submitAnswer', { isCorrect });
      this.userAnswer = '';
      this.selectedOptions = [];
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




<style scoped>
.game-question {
  text-align: center;
  margin: 20px;
}

.text-answer input {
  margin-bottom: 10px;
  padding: 8px;
  width: 80%;
}

.multiple-choice {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.option-card {
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  cursor: pointer;
  max-width: 250px; /* Begrenzte Breite für Bilder */
  text-align: center;
}

.option-card.selected {
  background-color: #4caf50;
  color: white;
}
.option-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin-top: 5px;
}
.question-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 10px 0;
  max-width: 450px;
}
/* 📱 Mobile Ansicht */
@media (max-width: 767px) {
  .question-image img {
    max-width: 250px;
  }
}

</style>
