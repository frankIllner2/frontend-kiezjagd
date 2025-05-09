<template>
  <div class="admin-container">
  <div class="edit-container">
    <div class="top-navigation">
      <router-link to="/admin" class="btn btn--back">
        <font-awesome-icon icon="arrow-left" /> Zu allen Spielen
      </router-link>
    </div>
    <h2>Spiel bearbeiten</h2>
    <section class="edit-section">
      <h3>Allgemeine Informationen</h3>
      <form @submit.prevent="updateGame" class="form-grid">
        <div class="form-row">
          <div class="form-group">
            <label for="name">Spielname</label>
            <input v-model="game.name" id="name" placeholder="Spielname eingeben" required />
          </div>

          <div class="form-group">
            <label for="city">Stadt/PLZ</label>
            <input v-model="game.city" id="city" placeholder="Stadt/PLZ eingeben" required />
          </div>
        </div>

        <div class="form-group"  :class="{ 'has-image': previewImage }">
          <OptimizedImageUploader v-model="uploadedImage" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="playtime">Dauer</label>
            <input v-model="game.playtime" id="playtime" placeholder="Spieldauer eingeben" required />
          </div>

          <div class="form-group">
            <label for="startloction">Start</label>
            <input v-model="game.startloction" id="startloction" placeholder="Wo startet das Spiel" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="endloction">Ende</label>
            <input v-model="game.endloction" id="endloction" placeholder="Wo endet das Spiel" required />
          </div>

          <div class="form-group">
            <label for="price">Preis</label>
            <input v-model="game.price" id="price" placeholder="Preis" required />
          </div>
        </div>

        <div class="form-group">
          <label for="description">Spielbeschreibung</label>
          <textarea 
            v-model="game.description" 
            id="description" 
            maxlength="560" 
            placeholder="Kurze Beschreibung des Spiels hinzufügen" 
            rows="4"
            required
          ></textarea>
          <small>{{ game.description?.length || 0 }}/560 Zeichen</small>
        </div>

        <div class="form-group">
          <label for="prehistory">Vorgeschichte zum Spiel</label>
          <textarea 
            v-model="game.prehistory" 
            id="prehistory" 
            maxlength="650" 
            placeholder="Text für die Vorgeschichte des Spiels" 
            rows="4"
            required
          ></textarea>
          <small>{{ game.prehistory?.length || 0 }}/650 Zeichen</small>
        </div>

        <div class="form-group">
          <label for="infohistory">Infogeschichte zum Spiel (letzte Seite)</label>
          <textarea 
            v-model="game.infohistory" 
            id="infohistory"
            maxlength="1200" 
            placeholder="Infos zur Geschichte" 
            rows="4"
            required
          ></textarea>
          <small>{{ game.infohistory?.length || 0}}/1200 Zeichen</small>
        </div>

        <div class="form-group">
          <label for="ageGroup">Altersgruppe</label>
          <select v-model="game.ageGroup" id="ageGroup" required>
            <option value="">Altersgruppe auswählen</option>
            <option>Mini</option>
            <option>Medi</option>
            <option>Maxi</option>
          </select>
        </div>

        <div class="form-group checkbox-group">
          <input type="checkbox" id="disabled" v-model="game.isDisabled" />
          <label for="disabled">Spiel deaktivieren</label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn--save">Spiel speichern</button>
        </div>
      </form>
    </section>
    <hr />
    <section class="edit-section">
      <h3>Fragen verwalten</h3>
      <QuestionList :questions="game.questions" @edit="editQuestion" @delete="deleteQuestion" @add="addQuestion" />
    </section>
    <div v-if="successMessage" class="success-message">{{ this.successMessage }}</div>
    <section v-if="showQuestionForm" class="edit-section">
      <QuestionForm 
        ref="questionForm" 
        :questionData="selectedQuestion" 
        :editing="editingQuestion" 
        :questionIndex="selectedQuestion.index" 
        @save="handleQuestionSave" 
        @cancel="cancelQuestionEdit" 
      />
    </section>
  </div>
</div>
</template>

<script>
import QuestionList from "@/components/QuestionList.vue";
import QuestionForm from "@/components/QuestionForm.vue";
import OptimizedImageUploader from "@/components/OptimizedImageUploader.vue";
import apiService from "@/services/apiService";

export default {
  components: { QuestionList, QuestionForm, OptimizedImageUploader },
  props: ["id"],
  data() {
    return {
      game: {
        city: "",
        name: "",
        ageGroup: "",
        encryptedId: "",
        description: "",
        prehistory: "",
        infohistory: "",
        questions: [],
        isDisabled: false,
        gameImage: "",
      },
      previewImage: null,
      uploadedImage: null,
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
        const response = await apiService.fetchGameById(id, true); //
        this.game = { ...response };
        this.uploadedImage = response.gameImage;
        console.log("🖼️ gameImage aus Response:", response.gameImage);

      } catch (error) {
        console.error("Fehler beim Laden des Spiels:", error);
      }
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.uploadedImage = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },
    removeImage() {
      this.uploadedImage = null;
      this.previewImage = null;
      this.game.gameImage = "";
    },
    addQuestion() {
      this.selectedQuestion = { question: "", answer: "" , index: this.game.questions.length};
      this.showQuestionForm = true;
      this.editingQuestion = false;
      
      // Warte darauf, dass das Formular wirklich gerendert wurde
      this.$nextTick(() => {
        const formElement = this.$refs.questionForm?.$el;
        if (formElement) {
          formElement.scrollIntoView({ behavior: "smooth", block: "start" });
          console.log("📜 Erfolgreich gescrollt!");
        } else {
          console.warn("⚠️ Element `questionForm` nicht gefunden!");
        }
      });
    },
    editQuestion(question) {
      this.selectedQuestion = { ...question };
      this.showQuestionForm = true;
      this.editingQuestion = true;
      const index = this.game.questions.findIndex(q => q._id === question._id);
      this.selectedQuestion.index = index;
    },
    async deleteQuestion(questionId) {
      await apiService.deleteQuestion(this.id, questionId);
      await this.fetchGame(this.id);
    },
    async handleQuestionSave(question) {
      // Nur lokale Aktualisierung der Fragenliste
      const questionIndex = this.game.questions.findIndex(q => q._id === question._id);
      if (questionIndex !== -1) {
        this.game.questions[questionIndex] = { ...question };
      } else {
        this.game.questions.push(question);
      }

      // Spiel aktualisieren, um die Fragenliste konsistent zu halten
      await this.fetchGame(this.game.encryptedId);

      this.cancelQuestionEdit();
    },
    cancelQuestionEdit() {
      this.selectedQuestion = { question: "", answer: "" };
      this.showQuestionForm = false;
      this.editingQuestion = false;
    },
    async updateGame() {
      try {
        let imageUrl = this.game.gameImage;


        if (this.uploadedImage) imageUrl = await apiService.uploadImage(this.uploadedImage);
        const gameData = { ...this.game, gameImage: imageUrl };
        await apiService.updateGame({ _id: this.id, ...gameData });
    
        // ✅ Toast anzeigen
        this.$root.showToast("Daten wurden erfolgreich gespeichert!");
        console.log("✅ Spiel erfolgreich aktualisiert");
      } catch (error) {
        console.error("❌ Fehler beim Aktualisieren des Spiels:", error);
        this.$root.showToast("Fehler beim Speichern der Daten!", "error"); // Optional: Toast für Fehler
      }
    }
  },
};
</script>

<style scoped>


/* Fragenverwaltung */

.question-actions button {
  width: 100px;
  text-align: center;
}



</style>
