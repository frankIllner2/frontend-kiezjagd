<template>
  <div ref="questionForm" id="edit-question-container" class="question-form">
    <h3>{{ isEditing ? "Frage bearbeiten" : "Neue Frage hinzufügen" }}</h3>
    <form @submit.prevent="saveQuestion">
      <!-- Frage -->
      <div class="form-group">
        <label for="question">
          <template v-if="question.type === 'anweisung'">Anweisung</template>
          <template v-else-if="question.type === 'next'">
            Weiter
            <span style="color: red; margin-left: 10px">Hinweis!</span>
          </template>
          <template v-else>Frage</template>
        </label>
        <textarea
          v-model="question.question"
          id="question"
          rows="2"
          required
          maxlength="400"
        />
        <small>{{ question.question?.length || 0 }}/400 Zeichen</small>
      </div>

      <!-- Antwort auf Frage -->
      <div class="form-group" v-if="questionIndex > 0 && question.type !== 'next'">
        <label for="question">Individuelle Antwort auf die Frage</label>
        <textarea
          v-model="question.answerquestion"
          id="answerQuestion"
          maxlength="350"
          rows="2"
        />
        <small>{{ question.answerquestion?.length || 0 }}/350 Zeichen</small>
      </div>

      <!-- Fragetyp -->
      <div class="form-group">
        <label for="type">Fragetyp</label>
        <select v-model="question.type" id="type">
          <option value="text">Freitext</option>
          <option value="multiple">Mehrfachauswahl</option>
          <option value="anweisung">Anweisung (GPS)</option>
          <option value="next">Weiter (ohne Wertung)</option>
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
        <div v-if="previewImage || question.imageUrl" class="image-preview">
          <img :src="previewImage || question.imageUrl" alt="Vorschau des Bildes" />
          <button type="button" class="btn btn--delete-image" @click="removeImage(null)">
            Bild Updaten
          </button>
        </div>
      </div>

      <!-- Sound hinzufügen -->
      <div class="form-group">
        <label for="sound">Ton hinzufügen</label>
        <input type="file" @change="onSoundChange" accept="audio/*" />
        <div v-if="previewSound || question.audioUrl" class="sound-preview">
          <audio :src="previewSound || question.audioUrl" controls />
          <button type="button" class="btn btn--delete-image" @click="removeSound">
            Ton updaten
          </button>
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
              <button
                type="button"
                class="btn btn--delete-image"
                @click="removeImage(index)"
              >
                Bild entfernen
              </button>
            </div>
          </div>
          <div class="edit-question-container">
            <label>
              <input type="checkbox" v-model="option.correct" />
              Korrekt
            </label>
            <button @click="removeOption(index)" type="button" class="btn-delete">
              🗑️
            </button>
          </div>
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
        type: "text",
        options: [],
        answer: "",
        imageUrl: "",
        coordinates: { lat: null, lon: null },
        question: {
          question: "",
          answerquestion: "",
        },
      }),
    },
    isEditing: {
      type: Boolean,
      default: false,
      isSaving: false, // Sperre hinzufügen
    },
    questionIndex: {
      type: Number,
      default: 0,
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
        audioUrl: "",
        coordinates: { lat: null, lon: null },
      },
      previewImage: null,
      uploadedFile: null,
      previewSound: null,
      uploadedSound: null,
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
        this.uploadedFile = null;
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
    onSoundChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.uploadedSound = file;
        this.previewSound = URL.createObjectURL(file);
      }
    },
    removeSound() {
      this.previewSound = null;
      this.uploadedSound = null;
      this.question.audioUrl = "";
    },

    async saveQuestion() {
      if (this.isSaving) {
        console.warn("⛔ Frage wird bereits gespeichert!");
        return; // Verhindert mehrfaches Speichern
      }
      this.isSaving = true;

      try {
        // Validierung für Mehrfachauswahl
        if (
          this.question.type === "multiple" && (!Array.isArray(this.question.options) || this.question.options.length === 0)
        ) {
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

        // Sound hochladen (falls vorhanden)
        if (this.uploadedSound) {
          const audioUrl = await apiService.uploadAudio(this.uploadedSound);
          console.log("audio-url", audioUrl);
          this.question.audioUrl = audioUrl;
          console.log("🎵 Sound erfolgreich hochgeladen:", audioUrl);
        }

        if (this.question._id) {
          console.log("✏️ Bearbeiten einer bestehenden Frage");
          if (this.question.type === "text") {
            await apiService.updateQuestion(this.$route.params.id, this.question._id, {
              question: this.question.question,
              answerquestion: this.question.answerquestion,
              answer: this.question.answer,
              type: this.question.type,
              imageUrl: this.question.imageUrl,
              audioUrl: this.question.audioUrl,
            });
          } else if (this.question.type === "multiple") {
            await apiService.updateQuestion(this.$route.params.id, this.question._id, {
              question: this.question.question,
              answerquestion: this.question.answerquestion,
              options: this.question.options,
              type: this.question.type,
              imageUrl: this.question.imageUrl,
              audioUrl: this.question.audioUrl,
            });
          } else if (this.question.type === "anweisung") {
            await apiService.updateQuestion(this.$route.params.id, this.question._id, {
              question: this.question.question,
              answerquestion: this.question.answerquestion,
              type: this.question.type,
              coordinates: this.question.coordinates,
            });
          } else if (this.question.type === "next") {
            await apiService.updateQuestion(this.$route.params.id, this.question._id, {
              question: this.question.question,
              answerquestion: this.question.answerquestion,
              type: this.question.type,
            });
          }
        } else {
          console.log("➕ Neue Frage hinzufügen");
          if (this.uploadedSound) {
            const audioUrl = await apiService.uploadAudio(this.uploadedSound);
            this.question.audioUrl = audioUrl;
            console.log("🔊 Audio erfolgreich hochgeladen:", audioUrl);
          }

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
        audioUrl: "",
        coordinates: { lat: null, lon: null },
      };
      this.previewImage = null;
      this.previewSound = null; 
      this.uploadedFile = null;
       this.uploadedSound = null; 
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
         this.previewSound = newData.audioUrl || null;
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
  flex-direction: column;
  width: 100%;
}

.option-item {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 5px;
  margin-bottom: 10px;
  background-color: #e9e2d0;
  padding: 10px;
  &:nth-child(even) {
    background-color: #f4ebd0;
  }
  input,
  select {
    width: 100%;
    padding: 5px;
  }
  .edit-question-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    label {
      display: flex;
      align-items: center;
      flex-direction: column;
    }
    button {
      display: flex;
      align-items: center;
      font-size: 20px;
    }
  }
}

.option-item .add-image {
  display: flex;
  width: 100%;
  align-items: center;
  .image-preview {
    display: flex;
    width: 100%;
    align-items: center;
    flex-direction: column;
    button {
      font-size: 16px;
      padding: 0;
      background-color: transparent;
    }
  }
}

.option-item input[type="text"] {
  flex: 1;
}
</style>
