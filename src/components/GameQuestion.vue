<template>
  <div class="game-question">
    <h3>Frage {{ currentIndex + 1 }}</h3>
    <p>{{ question.question }}</p>

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
        <!-- Textantwort -->
        <span v-if="option.type === 'text'">{{ option.text }}</span>
        <!-- Bildantwort -->
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
  },
  data() {
    return {
      userAnswer: '',
      selectedOptions: [],
    };
  },
  mounted() {
    // Lade gespeicherten Index aus localStorage
    const savedIndex = localStorage.getItem('currentQuestionIndex');
    if (savedIndex !== null) {
      this.$emit('updateIndex', parseInt(savedIndex, 10)); // Index zurücksetzen
    }
  },
  watch: {
    currentIndex(newIndex) {
      this.saveProgress(newIndex);
    },
  },
  methods: {
    toggleOption(index) {
      if (this.selectedOptions.includes(index)) {
        this.selectedOptions = this.selectedOptions.filter((i) => i !== index);
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
          .filter((index) => index !== null);

        isCorrect =
          JSON.stringify(correctIndexes.sort()) ===
          JSON.stringify(this.selectedOptions.sort());
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
      if (imageUrl.startsWith('http://localhost')) {
        return imageUrl.replace('localhost', window.location.hostname);
      }
      return imageUrl;
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
</style>
