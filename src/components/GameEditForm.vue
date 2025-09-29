<template>
  <div class="admin-container">
    <div class="edit-container">
      <div class="top-navigation">
        <router-link to="/admin" class="btn btn--back">
          <font-awesome-icon icon="arrow-left" /> Zu allen Spielen
        </router-link>
      </div>
      <h3>Spiel bearbeiten</h3>
      <section class="edit-section">
        <form @submit.prevent="updateGame" class="form-grid">
          <div class="form-row">
            <div class="form-group">
              <label for="name">Spielname</label>
              <input v-model="game.name" id="name" placeholder="Spielname eingeben" required />
            </div>

            <div class="form-group form-group--city-plz">
              <div class="two-col">
                <div class="col col-plz">
                  <label for="plz">PLZ</label>
                  <input
                    v-model="game.plz"
                    id="plz"
                    placeholder="z. B. 10407"
                    inputmode="numeric"
                    maxlength="5"
                    required
                  />
                </div>

                <div class="col col-city">
                  <label for="city">Stadt</label>
                  <input
                    v-model="game.city"
                    id="city"
                    placeholder="z. B. Berlin"
                    autocomplete="address-level2"
                    required
                  />
                </div>
              </div>
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

          <!-- 🔥 Sortierung (neu) -->
          <div class="form-group">
            <label for="sortIndex">Sortierung im Slider</label>
            <input
              id="sortIndex"
              v-model.number="game.sortIndex"
              type="number"
              min="0"
              step="1"
              placeholder="z. B. 1 für ganz vorne"
            />
            <small>Kleinere Zahl = weiter vorne. Standard: 9999.</small>
          </div>

          <div class="form-group">
            <label for="description">Spielbeschreibung</label>
            <textarea
              v-model="game.description"
              id="description"
              maxlength="500"
              placeholder="Kurze Beschreibung des Spiels hinzufügen"
              rows="4"
              required
            ></textarea>
            <small>{{ game.description?.length || 0 }}/500 Zeichen</small>
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
            <label for="mailtext">Individueller E-Mail Text</label>
            <textarea
              v-model="game.mailtext"
              id="mailtext"
              maxlength="1200"
              placeholder="Email Text zum Spiel"
              rows="4"
            ></textarea>
            <small>{{ game.mailtext?.length || 0 }}/1200 Zeichen</small>
            <br />
            <div class="form-group checkbox-group">
              <input type="checkbox" id="withCertificate" v-model="game.withCertificate" />
              <label for="withCertificate">E-Mail mit Urkunde im Anhang</label>
            </div>
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
            />
          </div>

          <div class="form-group">
            <label for="landingPageUrl">Url - LP</label>
            <input
              id="landingPageUrl"
              v-model="game.landingPageUrl"
              placeholder="/spiel/spurensuche-mama"
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
        landingPageUrl: "",
        infohistory: "",
        questions: [],
        isDisabled: false,
        isVoucher: false,
        voucherName: "",
        gameImage: "",
        sortIndex: 9999, // 🔥 neu: Default weit hinten
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
        // Default-Werte abfedern (insb. sortIndex)
        this.game = { voucherName: "", sortIndex: 9999, ...response };
        if (this.game.sortIndex === undefined || this.game.sortIndex === null) {
          this.game.sortIndex = 9999;
        }
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
          voucherName: this.game.isVoucher ? this.game.voucherName : "",
          // sortIndex ist bereits in this.game enthalten
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

<style lang="sass" scoped>
.form-group--city-plz .two-col {
  display: grid;
  grid-template-columns: minmax(90px,140px) 1fr;
  gap: 12px;
  align-items: end;
}

.form-group--city-plz .col input {
  width: 100%;
}

@media (max-width: 640px) {
  .form-group--city-plz .two-col {
    grid-template-columns: 1fr;
  }
}
</style>
