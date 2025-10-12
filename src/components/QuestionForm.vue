<template>
  <div ref="questionForm" id="edit-question-container" class="question-form">
    <h3>{{ isEditing ? "Frage bearbeiten" : "Neue Frage hinzufügen" }}</h3>
    <form @submit.prevent="saveQuestion">

      <!-- Antwort auf Frage -->
      <div class="form-group" v-if="questionIndex > 0">
        <label for="answerQuestion">Antwort auf die Frage zuvor</label>
        <textarea
          v-model="question.answerquestion"
          id="answerQuestion"
          maxlength="450"
          rows="2"
        />
        <small>{{ question.answerquestion?.length || 0 }}/450 Zeichen</small>
      </div>
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
          maxlength="500"
        />
        <small>{{ question.question?.length || 0 }}/500 Zeichen</small>
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
              <option value="audio">Nur Sound</option>
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

          <div class="add-audio" v-if="option.type === 'audio'">
            <input type="file" @change="onOptionAudioChange($event, index)" accept="audio/*" />
            <div v-if="option.audioUrl" class="audio-preview">
              <audio :src="option.audioUrl" controls />
              <button type="button" @click="removeOptionAudio(index)" class="btn btn--delete-image">Ton entfernen</button>
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
    questionData: Object,
    isEditing: Boolean,
    questionIndex: Number
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
        answerquestion: ""
      },
      previewImage: null,
      uploadedFile: null,
      previewSound: null,
      uploadedSound: null
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
        if (this.question.options && this.question.options[index]) {
          this.question.options[index].imageUrl = null;
        }
      } else {
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
        audioUrl: "",
        correct: false
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
      if (this.isSaving) return;
      this.isSaving = true;
      try {
        if (this.question.type === "multiple" && (!Array.isArray(this.question.options) || this.question.options.length === 0)) {
          alert("⚠️ Bitte mindestens eine Option hinzufügen.");
          return;
        }
        if (this.question.type === "anweisung" && (!this.question.coordinates.lat || !this.question.coordinates.lon)) {
          alert("⚠️ GPS-Koordinaten sind erforderlich.");
          return;
        }
        if (this.uploadedFile) {
          const imageUrl = await apiService.uploadImage(this.uploadedFile);
          this.question.imageUrl = imageUrl;
        }
        if (this.uploadedSound) {
          const audioUrl = await apiService.uploadAudio(this.uploadedSound);
          this.question.audioUrl = audioUrl;
        }
        if (this.question._id) {
          await apiService.updateQuestion(this.$route.params.id, this.question._id, this.question);
        } else {
          await apiService.addQuestion(this.$route.params.id, this.question);
        }
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
        answerquestion: ""
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
    async onOptionAudioChange(event, index) {
      const file = event.target.files[0];
      if (file) {
        const audioUrl = await apiService.uploadAudio(file);
        this.question.options[index].audioUrl = audioUrl;
      }
    },
    removeOptionAudio(index) {
      if (this.question.options && this.question.options[index]) {
        this.question.options[index].audioUrl = null;
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
      }
    }
  }
};
</script>
