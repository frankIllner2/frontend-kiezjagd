<template>
  <div id="edit-question-container" class="question-form">
    <h3>{{ isEditing ? "Frage bearbeiten" : "Neue Frage hinzufügen" }}</h3>
    <form @submit.prevent="saveQuestion">
      <!-- Frage -->
      <div class="form-group">
        <label for="question">Frage</label>
        <input v-model="question.question" id="question" type="text" required />
      </div>

      <!-- Fragetyp -->
      <div class="form-group">
        <label for="type">Fragetyp</label>
        <select v-model="question.type" id="type">
          <option value="text">Freitext</option>
          <option value="multiple">Mehrfachauswahl</option>
        </select>
      </div>

      <!-- Bild hinzufügen -->
      <div class="form-group">
        <label for="image">Bild hinzufügen</label>
        <input type="file" @change="onFileChange" accept="image/*" />
        <div v-if="previewImage" class="image-preview">
          <img :src="previewImage" alt="Vorschau des Bildes" />
          <button type="button" @click="removeImage">Bild entfernen</button>
        </div>
      </div>

      <!-- Optionen für Mehrfachauswahl -->
      <div v-if="question.type === 'multiple'" class="options-group">
        <h4>Antworten</h4>
        <div v-for="(option, index) in question.options" :key="index" class="option-item">
          <input v-model="option.text" placeholder="Antworttext" />
          <label>
            <input type="checkbox" v-model="option.correct" />
            Korrekt
          </label>
          <button @click="removeOption(index)" type="button" class="btn-delete">
            🗑️
          </button>
        </div>
        <button @click="addOption" type="button" class="btn-add-option">
          Antwort hinzufügen
        </button>
      </div>

      <!-- Antwort für Freitext -->
      <div v-if="question.type === 'text'" class="form-group">
        <label for="answer">Korrekte Antwort</label>
        <input v-model="question.answer" id="answer" type="text" />
      </div>

      <button type="submit" class="btn-save">Speichern</button>
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
        type: "text",
        options: [],
        answer: "",
        imageUrl: "",
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
      },
      previewImage: null,
      uploadedFile: null,
    };
  },
  created() {
    if (this.questionData) {
      this.question = { ...this.questionData };
      this.previewImage = this.question.imageUrl || null;
    }
  },
  methods: {
    addOption() {
      if (!this.question.options) {
        this.question.options = [];
      }
      this.question.options.push({ text: "", correct: false });
    },
    removeOption(index) {
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
        // Bearbeitung von Freitext-Fragen
        await apiService.updateQuestion(this.$route.params.id, this.question._id, {
          question: this.question.question,
          answer: this.question.answer,
          type: this.question.type,
          imageUrl: this.question.imageUrl,
        });
      } else if (this.question.type === "multiple") {
        // Bearbeitung von Mehrfachauswahl-Fragen
        await apiService.updateQuestion(this.$route.params.id, this.question._id, {
          question: this.question.question,
          options: this.question.options,
          type: this.question.type,
          imageUrl: this.question.imageUrl,
        });
      }
    } else {
      console.log("➕ Neue Frage hinzufügen");
      await apiService.addQuestion(this.$route.params.id, this.question);
    }

    // Event feuern
    this.$emit("save", { ...this.question });
    this.resetForm();
  } catch (error) {
    console.error("❌ Fehler beim Speichern der Frage:", error);
    alert("❌ Fehler beim Speichern der Frage.");
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
    removeImage() {
      this.uploadedFile = null;
      this.previewImage = null;
      this.question.imageUrl = "";
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
  max-width: 600px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

h3 {
  text-align: center;
  margin-bottom: 15px;
  font-size: 1.4rem;
  color: #4caf50;
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
  font-size: 12px;
}

input,
select {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.options-group {
  margin-top: 15px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.option-item input[type="text"] {
  flex: 1;
}

.btn-delete {
  background-color: #f9f9f9;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.btn-add-option {
  margin-top: 10px;
  background-color: #1976d2;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.image-preview {
  margin-top: 10px;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin-bottom: 10px;
}

.image-preview button {
  background-color: #f44336;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save {
  width: 100%;
  margin-top: 15px;
  background-color: #4caf50;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}
</style>
