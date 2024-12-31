<template>
  <div class="edit-container">
    <!-- Navigation zurück zur Übersicht -->
    <div class="top-navigation">
      <router-link to="/admin" class="btn-back">
        <font-awesome-icon icon="arrow-left" /> Zu allen Spielen</router-link
      >
    </div>

    <h2>Spiel bearbeiten</h2>

    <!-- Allgemeine Spieldaten -->
    <section class="edit-section">
      <h3>Allgemeine Informationen</h3>
      <form @submit.prevent="updateGame" class="form-grid">
        <div class="form-group">
          <label for="city">Stadt:</label>
          <input v-model="game.city" id="city" placeholder="Stadt eingeben" />
        </div>

        <div class="form-group">
          <label for="name">Spielname:</label>
          <input v-model="game.name" id="name" placeholder="Spielname eingeben" />
        </div>

        <div class="form-group">
          <label for="ageGroup">Altersgruppe:</label>
          <input
            v-model="game.ageGroup"
            id="ageGroup"
            placeholder="Altersgruppe eingeben"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">Spiel speichern</button>
        </div>
      </form>
    </section>

    <hr />

    <!-- Fragenverwaltung -->
    <section class="edit-section">
      <h3>Fragen verwalten</h3>
      <QuestionList
        :questions="game.questions"
        @edit="editQuestion"
        @delete="deleteQuestion"
        @add="addQuestion"
      />
    </section>
    <div v-if="successMessage" class="success-message">
      {{ this.successMessage }}
    </div>
    <!-- Formular für neue Frage / Bearbeitung -->
    <section v-if="showQuestionForm" class="edit-section">
      <QuestionForm
        :questionData="selectedQuestion"
        :editing="editingQuestion"
        @save="saveQuestion"
        @cancel="cancelQuestionEdit"
      />
    </section>
  </div>
</template>

<script>
import QuestionList from "@/components/QuestionList.vue";
import QuestionForm from "@/components/QuestionForm.vue";
import apiService from "@/services/apiService";

export default {
  components: { QuestionList, QuestionForm },
  props: ["id"],
  data() {
    return {
      game: {
        city: "",
        name: "",
        ageGroup: "",
        encryptedId: "",
        questions: [],
      },
      selectedQuestion: { question: "", answer: "" },
      showQuestionForm: false,
      editingQuestion: false,
      successMessage: "",
    };
  },
  async mounted() {
    const gameId = this.id || this.$route.params.id;
    if (gameId) {
      await this.fetchGame(gameId);
    }
  },
  methods: {
    async fetchGame(id) {
      try {
        const response = await apiService.fetchGameById(id);
        this.game = { ...response };
      } catch (error) {
        console.error("Fehler beim Laden des Spiels:", error);
      }
    },

    addQuestion() {
      this.selectedQuestion = { question: "", answer: "" };
      this.showQuestionForm = true;
      this.editingQuestion = false;
    },
    editQuestion(question) {
      this.selectedQuestion = { ...question };
      this.showQuestionForm = true;
      this.editingQuestion = true;
    },
    async deleteQuestion(questionId) {
      await apiService.deleteQuestion(this.id, questionId);
      await this.fetchGame(this.id);
    },
    async saveQuestion(question) {
      try {
        if (this.editingQuestion) {
          // Lokale Liste aktualisieren
          const questionIndex = this.game.questions.findIndex(
            (q) => q._id === question._id
          );
          if (questionIndex !== -1) {
            this.game.questions[questionIndex] = { ...question };
          }

          // API-Aufruf für Text- und Multiple-Fragen
          if (question.type === "text") {
            await apiService.updateQuestion(this.game.encryptedId, question._id, {
              question: question.question,
              answer: question.answer,
              type: question.type,
              imageUrl: question.imageUrl,
            });
          } else {
            await apiService.updateQuestion(this.game.encryptedId, question._id, {
              question: question.question,
              options: question.options,
              type: question.type,
              imageUrl: question.imageUrl,
            });
          }
        } else {
          // Neue Frage hinzufügen
          const newQuestion = await apiService.addQuestion(
            this.game.encryptedId,
            question
          );
          this.game.questions.push(newQuestion);
        }
        // Spiel aktualisieren (lokal, ohne Navigation)
        await this.fetchGame(this.game.encryptedId);

        this.cancelQuestionEdit(); // Formular schließen
        
        setTimeout(() => {
          this.successMessage = "✅ Frage erfolgreich gespeichert!";
        }, 300);
      } catch (error) {
        console.error("❌ Fehler beim Speichern der Frage:", error);
        alert("Fehler beim Speichern der Frage.");
      }
    },
    cancelQuestionEdit() {
      this.selectedQuestion = { question: "", answer: "" };
      this.showQuestionForm = false;
      this.editingQuestion = false;
    },
    async updateGame() {
      try {
        await apiService.updateGame({ _id: this.id, ...this.game });
        // Keine Navigation mehr hier!
        console.log("✅ Spiel erfolgreich aktualisiert");
      } catch (error) {
        console.error("❌ Fehler beim Aktualisieren des Spiels:", error);
        alert("Fehler beim Aktualisieren des Spiels.");
      }
    },
  },
};
</script>

<style scoped>
/* Allgemeine Container-Stile */
.edit-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  text-align: left;
}

/* Navigation oben */
.top-navigation {
  margin-bottom: 20px;
}

.btn-back {
  display: inline-block;
  margin-bottom: 10px;
  background-color: #4caf50;
  color: white;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 4px;
}

.btn-back:hover {
  background-color: #388e3c;
}

/* Abschnittsstile */
.edit-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

/* Formular */
.form-group {
  margin-bottom: 15px;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Fragenverwaltung */
.question-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}

.question-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.question-content {
  flex: 1;
  text-align: left;
}

.question-content p {
  margin: 5px 0;
}

/* Buttons vertikal untereinander ausrichten */
.question-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-start;
  margin-left: 20px;
}

.question-actions button {
  width: 100px;
  text-align: center;
}

/* Buttons */
.btn-primary {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #388e3c;
}

.btn-secondary {
  background-color: #ff9800;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #e68900;
}

.btn-danger {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger:hover {
  background-color: #d32f2f;
}

.btn-add {
  margin-top: 15px;
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-add:hover {
  background-color: #1976d2;
}

/* Aktionen */
.form-actions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  margin-top: 15px;
}
@media (min-width: 1200px) {
  input {
    width: 50%;
  }
}
.success-message {
  margin-top: 10px;
  padding: 10px;
  border-width: 2px;
  border-style: solid;
  border-color: #4caf50;
  color: #000;
  text-align: center;
  border-radius: 4px;
  font-weight: bold;
}
</style>
