<template>
  <div ref="questionForm" id="edit-question-container" class="question-form">
    <h3>{{ isEditing ? "Frage bearbeiten" : "Neue Frage hinzufügen" }}</h3>
    <form @submit.prevent="saveQuestion">
      <!-- Frage -->
      <div class="form-group">
        <label for="question">{{
          question.type === "anweisung" ? "Anweisung" : "Frage"
        }}</label>
        <input v-model="question.question" id="question" type="text" required />
      </div>

      <!-- Antwort auf Frage -->
      <div class="form-group">
        <label for="question">Individuelle Antwort auf die Frage</label>
        <input v-model="question.answerquestion" id="answerQuestion" type="text" required />
      </div>


      <!-- Fragetyp -->
      <div class="form-group">
        <label for="type">Fragetyp</label>
        <select v-model="question.type" id="type">
          <option value="text">Freitext</option>
          <option value="multiple">Mehrfachauswahl</option>
          <option value="anweisung">Anweisung (GPS)</option>
        </select>
      </div>

      <!-- GPS-Koordinaten für Anweisung -->
      <div v-if="question.type === 'anweisung'" class="form-group">
        <label>GPS-Koordinaten (Antwort)</label>
        <input
          v-model.number="question.coordinates.lat"
          placeholder="Breitengrad (Latitude)"
          type="number"
          step="any"
          required
        />
        <input
          v-model.number="question.coordinates.lon"
          placeholder="Längengrad (Longitude)"
          type="number"
          step="any"
          required
        />
      </div>

      <!-- Bild hinzufügen -->
      <div class="form-group">
        <label for="image">Bild hinzufügen</label>
        <input type="file" @change="onFileChange" accept="image/*" />
        <div v-if="previewImage" class="image-preview">
          <img :src="previewImage" alt="Vorschau des Bildes" />
          <button type="button" class="btn btn--delete-image" @click="removeImage(null)">Bild entfernen</button>
        </div> 
      </div>

      <!-- Optionen für Mehrfachauswahl -->
      <div v-if="question.type === 'multiple'" class="options-group">
        <h4>Antworten</h4>
        <div v-for="(option, index) in question.options" :key="index" class="option-item">
          <div class="option-type-selector">
            <label>Antworttyp</label>
            <select v-model="option.type">
              <option value="text">Nur Text</option>
              <option value="image">Nur Bild</option>
              <option value="both">Text und Bild</option>
            </select>
          </div>

          <!-- Textantwort -->
          <input
            v-if="option.type === 'text' || option.type === 'both'"
            v-model="option.text"
            placeholder="Antworttext"
          />

          <!-- Bildantwort -->
          <div class="add-image" v-if="option.type === 'image' || option.type === 'both'">
            <input type="file" @change="onImageChange($event, index)" accept="image/*" />
            <div v-if="option.imageUrl" class="image-preview">
              <img :src="option.imageUrl" alt="Bildantwort" />
              <button type="button" class="btn btn--delete-image" @click="removeImage(index)">Bild entfernen</button>
            </div>
          </div>

          <label>
            <input type="checkbox" v-model="option.correct" />
            Korrekt
          </label>
          <button @click="removeOption(index)" type="button" class="btn-delete">
            🗑️
          </button>
        </div>
        <button @click="addOption" type="button" class="btn btn-add-option">
          Antwort hinzufügen
        </button>
      </div>

      <!-- Antwort für Freitext -->
      <div v-if="question.type === 'text'" class="form-group">
        <label for="answer">Korrekte Antwort</label>
        <input v-model="question.answer" id="answer" type="text" />
      </div>
      <br />
      <button type="submit" class="btn btn--save">Speichern</button>
    </form>
  </div>
</template>

<script>
import { apiService } from "@/services/apiService";

export default {
  props: {
    questionData: {
      type: Object,
      default: () => ({
        question: "",
        answerquestion: "",
        type: "text",
        options: [],
        answer: "",
        imageUrl: "",
        coordinates: { lat: null, lon: null },
      }),
    },
    isEditing: {
      type: Boolean,
      default: false,
      isSaving: false, // Sperre hinzufügen
    },
  },
  data() {
    return {
      question: {
        _id: null,
        question: "",
        type: "text",
        options: [],
        answer: "",
        imageUrl: "",
        coordinates: { lat: null, lon: null },
      },
      previewImage: null,
      uploadedFile: null,
    };
  },
  created() {
    if (this.questionData) {
      this.question = { ...this.questionData };
      if (!this.question.coordinates) {
        this.question.coordinates = { lat: null, lon: null };
      }
      this.previewImage = this.question.imageUrl || null;
    }
  },
  methods: {
    async onImageChange(event, index) {
      const file = event.target.files[0];
      if (file) {
        const imageUrl = await apiService.uploadImage(file);
        this.question.options[index].imageUrl = imageUrl;
      }
    },
    removeImage(index = null) {
      if (index !== null) {
        // Entfernt Bild aus den Antwortoptionen
        if (this.question.options && this.question.options[index]) {
          this.question.options[index].imageUrl = null;
        }
      } else {
        // Entfernt das Hauptbild
        this.previewImage = null;
        this.question.imageUrl = "";
      }
    },
    addOption() {
      if (!this.question.options) {
        this.question.options = [];
      }
      this.question.options.push({
        type: "text",
        text: "",
        imageUrl: "",
        correct: false,
      });
    },
    removeOption(index) {
      this.uploadedFile = null;
      this.previewImage = null;
      this.question.imageUrl = "";
      if (this.question.options && this.question.options.length > index) {
        this.question.options.splice(index, 1);
      }
    },
    async saveQuestion() {
      if (this.isSaving) {
        console.warn("⛔ Frage wird bereits gespeichert!");
        return; // Verhindert mehrfaches Speichern
      }
      this.isSaving = true;

      try {
        // Validierung für Mehrfachauswahl
        if (this.question.type === "multiple" && this.question.options.length === 0) {
          alert("⚠️ Bitte mindestens eine Option hinzufügen.");
          return;
        }

        // Validierung für GPS-Anweisungen
        if (
          this.question.type === "anweisung" &&
          (!this.question.coordinates.lat || !this.question.coordinates.lon)
        ) {
          alert("⚠️ GPS-Koordinaten sind erforderlich.");
          return;
        }

        // Bild hochladen (falls vorhanden)
        if (this.uploadedFile) {
          const imageUrl = await apiService.uploadImage(this.uploadedFile);
          this.question.imageUrl = imageUrl;
          console.log("📸 Bild erfolgreich hochgeladen:", imageUrl);
        }

        console.log("📝 Frage-ID:", this.question._id);

        if (this.question._id) {
          console.log("✏️ Bearbeiten einer bestehenden Frage");
          if (this.question.type === "text") {
            await apiService.updateQuestion(this.$route.params.id, this.question._id, {
              question: this.question.question,
              answerquestion: this.question.answerquestion,
              answer: this.question.answer,
              type: this.question.type,
              imageUrl: this.question.imageUrl,
            });
          } else if (this.question.type === "multiple") {
            await apiService.updateQuestion(this.$route.params.id, this.question._id, {
              question: this.question.question,
              answerquestion: this.question.answerquestion,
              options: this.question.options,
              type: this.question.type,
              imageUrl: this.question.imageUrl,
            });
          } else if (this.question.type === "anweisung") {
            await apiService.updateQuestion(this.$route.params.id, this.question._id, {
              question: this.question.question,
              answerquestion: this.question.answerquestion,
              type: this.question.type,
              coordinates: this.question.coordinates,
            });
          }
        } else {
          console.log("➕ Neue Frage hinzufügen");
          await apiService.addQuestion(this.$route.params.id, this.question);
        }

        // Event feuern
        this.$emit("save", { ...this.question });
        this.$root.showToast("Daten wurden erfolgreich gespeichert!");
        this.resetForm();
      } catch (error) {
        console.error("❌ Fehler beim Speichern der Frage:", error);
        this.$root.showToast("Fehler beim Speichern der Frage");
      } finally {
        this.isSaving = false;
      }
    },

    resetForm() {
      this.question = {
        question: "",
        type: "text",
        options: [],
        answer: "",
        imageUrl: "",
        coordinates: { lat: null, lon: null },
      };
      this.previewImage = null;
      this.uploadedFile = null;
    },

    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.uploadedFile = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },
  },
  watch: {
    questionData: {
      immediate: true,
      handler(newData) {
        this.question = { ...newData };
        this.previewImage = newData.imageUrl || null;
        console.log("📝 Geladene Frage:", this.question);
      },
    },
  },
};
</script>

<style scoped>
.question-form {
  margin: 20px auto;
  width: 100%;
  background: #f9f9f9;
  border-radius: 8px;
}

.option-type-selector {
  display: inline-flex;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
}

.option-item .add-image {
  display: flex;
  width: 100%;
}

.option-item input[type="text"] {
  flex: 1;
}


</style>
