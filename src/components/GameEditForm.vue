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

          <div class="form-group" :class="{ 'has-image': previewImage }">
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
            ></textarea>
            <small>{{ game.infohistory?.length || 0 }}/1200 Zeichen</small>
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

            <input type="checkbox" id="isVoucher" v-model="game.isVoucher" />
            <label for="isVoucher">Spiel mit Gutschein-Code einlösen</label>

          </div>

          <div class="form-group" v-if="game.isVoucher">
            <label for="voucherName">Gutschein-Name (Admin)</label>
            <input
              id="voucherName"
              v-model="game.voucherName"
              placeholder="z. B. TEST2025"
              pattern="[A-Za-z0-9-]+"
            />
            
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn--save">Spiel speichern</button>
          </div>
        </form>
      </section>

      <hr />
      <section class="edit-section">
        <h3>Fragen verwalten</h3>
        <QuestionList
          :questions="game.questions"
          :gameId="game._id"
          :activeQuestionId="selectedQuestion?._id"
          @edit="editQuestion"
          @delete="deleteQuestion"
          @add="addQuestion"
          @save="handleQuestionSave"
          @cancel="cancelQuestionEdit"
          @update="updateQuestion"
        />
      </section>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    </div>
  </div>
</template>
<script>
import QuestionList from "@/components/QuestionList.vue"; 
import OptimizedImageUploader from "@/components/OptimizedImageUploader.vue"; 
import apiService from "@/services/apiService";

export default {
  components: { QuestionList, OptimizedImageUploader },
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
        isVoucher: false,
        voucherName: "",        // 👈 neu
        gameImage: "",
      },
      previewImage: null,
      uploadedImage: null,
      selectedQuestion: null,
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
        const response = await apiService.fetchGameById(id, true);
        // Falls ältere Datensätze noch kein voucherName haben → Default setzen
        this.game = { voucherName: "", ...response };
        this.uploadedImage = response.gameImage;
      } catch (error) {
        console.error("Fehler beim Laden des Spiels:", error);
      }
    },

    async deleteQuestion(questionId) {
      await apiService.deleteQuestion(this.id, questionId);
      await this.fetchGame(this.id);
    },
    async handleQuestionSave() {
      await this.fetchGame(this.game.encryptedId);
      this.cancelQuestionEdit();
    },
    editQuestion(question) {
      this.selectedQuestion = { ...question };
    },
    addQuestion() {
      this.selectedQuestion = {
        question: "",
        answer: "",
        answerquestion: "",
        options: [],
        type: "text",
        coordinates: { lat: null, lon: null },
        index: this.game.questions.length,
      };
    },
    cancelQuestionEdit() {
      this.selectedQuestion = null;
    },
    updateQuestion(updatedQuestion) {
      const index = this.game.questions.findIndex((q) => q._id === updatedQuestion._id);
      if (index !== -1) {
        this.game.questions.splice(index, 1, updatedQuestion);
      } else {
        this.game.questions.push(updatedQuestion);
      }
    },

    async updateGame() {
      try {
        let imageUrl = this.game.gameImage;
        if (this.uploadedImage instanceof File) {
          imageUrl = await apiService.uploadImage(this.uploadedImage);
        }

        const payload = {
          ...this.game,
          gameImage: imageUrl,
          // Sicherheit: Wenn Gutscheine für dieses Spiel deaktiviert sind,
          // voucherName serverseitig nicht versehentlich beibehalten.
          voucherName: this.game.isVoucher ? this.game.voucherName : "",
        };

        await apiService.updateGame({ _id: this.id, ...payload });
        this.$root.showToast("Daten wurden erfolgreich gespeichert!");
      } catch (error) {
        console.error("❌ Fehler beim Aktualisieren des Spiels:", error);
        this.$root.showToast("Fehler beim Speichern der Daten!", "error");
      }
    },
  },
};
</script>
