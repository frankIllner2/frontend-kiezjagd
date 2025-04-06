<template>
  <div class="question-list">

    <div class="questions-container">
      <div
        v-for="(question, index) in questions"
        :key="question._id"
        class="question-card"
      >
        <div v-if="question" class="question-header">
          <h4>
            {{ index + 1 }} {{ question?.type === "anweisung" ? "Anweisung" : "Frage" }}
          </h4>
        </div>
        <div v-if="question" class="question-content">
          <p>
            <strong>{{ question?.type === "anweisung" ? "Anweisung" : "Frage" }}:</strong>
            {{ question.question }}
          </p>

          <!-- Freitext-Antwort anzeigen -->
          <p v-if="question.type === 'text'">
            <strong>Antwort:</strong> {{ question.answer }}
          </p>

          <!-- Mehrfachauswahl-Antworten anzeigen -->
          <div v-if="question.type === 'multiple'">
            <strong>Antworten:</strong>
            <ul>
              <li v-for="(option, i) in question.options" :key="i">
                <!-- Textantwort -->
                <span v-if="option.type === 'text'">{{ option.text }}</span>
                <!-- Bildantwort -->
                <span v-else-if="option.type === 'image'" class="option-image">
                  <img :src="option.imageUrl" alt="Option Bild" />
                </span>
                <span v-else-if="option.type === 'both'" class="option-image">
                  <img :src="option.imageUrl" alt="Option Bild" />
                  <span>{{ option.text }}</span>
                </span>
                <span v-if="option.correct"> ✅</span>
              </li>
            </ul>
          </div>

          <!-- Antwort für Anweisung (GPS-Koordinaten) anzeigen -->
          <p v-if="question.type === 'anweisung'">
            <strong>Koordinaten:</strong> {{ question.coordinates.lat }},
            {{ question.coordinates.lon }}
          </p>

          <!-- Bild anzeigen, falls vorhanden -->
          <div v-if="question.imageUrl" class="question-image">
            <img :src="question.imageUrl" alt="Fragenbild" />
          </div>
        </div>
        <div class="question-actions">
          <button @click="handleEdit(question)" class="btn-action btn-edit">
            <font-awesome-icon icon="edit" />
          </button>
          <button @click="$emit('delete', question._id)" class="btn-action btn-delete">
            <font-awesome-icon icon="trash" />
          </button>
        </div>
      </div>
    </div>
    <button @click="$emit('add')" class="btn-add">Neue Frage hinzufügen</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      question: {}, // ✅ Leeres Objekt als Standardwert
    };
  },
  props: {
    questions: {
      type: Array,
      required: true,
    },
  },
  methods: {
    handleEdit(question) {
      if (!question) {
        console.error("⚠️ Fehler: Frage-Objekt ist undefined");
        return;
      }

      this.$emit("edit", { ...question }); // Stelle sicher, dass eine Kopie übergeben wird

      // Sanftes Scrollen zum Formular
      this.$nextTick(() => {
        const editForm = document.getElementById("edit-question-container");
        if (editForm) {
          editForm.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          console.warn(
            '⚠️ Element mit ID "edit-question-container" wurde nicht gefunden.'
          );
        }
      });
    },
  },
};
</script>
<style scoped>
/* 🌟 Allgemeine Stile für die Frage-Liste */
.question-list {
  margin-top: 20px;
  padding: 10px;
  text-align: center;
}

/* 🌟 Container für die Fragen */
.questions-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
}

/* 🌟 Einzelne Frage-Karte */
.question-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: left;
  transition: transform 0.2s ease-in-out;
}

.question-card:hover {
  transform: scale(1.02);
}

/* 🌟 Frage-Header */
.question-header {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

/* 🌟 Frage-Inhalt */
.question-content p {
  margin: 5px 0;
  font-size: 0.95rem;
  color: #555;
}

/* 🌟 Antworten */
.question-content ul {
  list-style-type: none;
  padding: 0;
  margin: 5px 0;
}

.question-content li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px 10px;
  margin-bottom: 5px;
}

/* 🌟 Bild-Vorschau */
.question-image {
  margin-top: 10px;
  text-align: center;
}
.option-image img {
  max-width: 50px;
  max-height: 50px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.question-image img {
  max-width: 100px;
  max-height: 100px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid #ddd;
}

/* 🌟 Aktionen */
.question-actions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  margin-top: 10px;
}

.question-actions button {
  padding: 6px 12px;
  font-size: 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  background-color: #4caf50;
  color: white;
  border: none;
  transition: background-color 0.3s ease;
}

.question-actions button:hover {
  background-color: #388e3c;
}

/* 🌟 Button für neue Frage */
.btn-add {
  margin-top: 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-add:hover {
  background-color: #388e3c;
}

/* 📱 Mobile Ansicht */
@media (max-width: 767px) {
  .questions-container {
    flex-direction: column;
    gap: 10px;
  }


  .question-actions button {
    font-size: 0.8rem;
    padding: 5px 10px;
  }
}

/* 💻 Desktop Ansicht */
@media (min-width: 768px) {
  .questions-container {
    flex-wrap: wrap;
    gap: 20px;
    justify-content: flex-start;
  }

  .question-card {
    width: 100%
  }
}

@media (min-width: 1200px) {
  .question-card {
    width: 100%;
  }

  .question-actions button {
    font-size: 0.8rem;
    padding: 4px 8px;
  }
}
</style>
