<template>
  <div class="question-list">
    <draggable
      v-model="localQuestions"
      item-key="_id"
      handle=".question-header"
      @end="onDragEnd"
      class="questions-container"
    >
      <template #header></template>
      <template #item="{ element: question, index }">
        <div class="question-card">
          <div class="question-header">
            <h4>
              {{ index + 1 }}
              {{ question.type === 'anweisung'
                ? 'Anweisung'
                : question.type === 'next'
                ? 'Weiter'
                : 'Frage' }}
            </h4>
          </div>

          <div class="question-content">
            <p v-if="question.answerquestion">
              <strong>Antwort auf die Frage zuvor:</strong> {{ question.answerquestion }}
            </p>
            <p><strong>Frage:</strong> {{ question.question }}</p>

            <p v-if="question.type === 'text'">
              <strong>Antwort:</strong> {{ question.answer }}
            </p>
            <div v-if="question.type === 'multiple'">
              <strong>Antworten:</strong>
              <ul>
                <li v-for="(option, i) in question.options" :key="i">
                  <span v-if="option.type === 'text'">{{ option.text }}</span>
                  <span v-else-if="option.type === 'image'">
                    <img :src="option.imageUrl" alt="Bild" />
                  </span>
                  <span v-else-if="option.type === 'both'">
                    <img :src="option.imageUrl" alt="Bild" />
                    <span>{{ option.text }}</span>
                  </span>
                  <span v-else-if="option.type === 'audio'">
                    <audio :src="option.audioUrl" controls />
                  </span>
                  <span v-if="option.correct"> ✅</span>
                </li>
              </ul>
            </div>

            <p v-if="question.type === 'anweisung'">
              <strong>Koordinaten:</strong>
              {{ question.coordinates.lat }}, {{ question.coordinates.lon }}
            </p>
            <div v-if="question.imageUrl" class="question-image">
              <img :src="question.imageUrl" alt="Fragenbild" />
            </div>
            <div v-if="question.audioUrl" class="question-audio">
              <strong>Ton:</strong>
              <audio :src="question.audioUrl" controls />
            </div>
          </div>

          <div class="question-actions">
            <button @click="toggleEdit(question)" class="btn-action btn-edit">
              <font-awesome-icon icon="edit" />
            </button>
            <button @click="$emit('delete', question._id)" class="btn-action btn-delete">
              <font-awesome-icon icon="trash" />
            </button>
          </div>

          <!-- Inline-Formular bei Bearbeitung -->
          <QuestionForm
            v-if="editingId === question._id"
            :questionData="question"
            :isEditing="true"
            :questionIndex="index"
            @save="handleSave"
          />
        </div>
      </template>
    </draggable>

    <!-- Neues Frageformular -->
    <div v-if="showNewForm" class="question-new-form">
      <QuestionForm
        :questionData="emptyQuestion"
        :isEditing="false"
        :questionIndex="localQuestions.length"
        @save="handleNewSave"
      />
    </div>

    <button @click="startNewForm" class="btn-add">Neue Frage hinzufügen</button>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import QuestionForm from './QuestionForm.vue';
import apiService from '@/services/apiService';

export default {
  components: { draggable, QuestionForm },
  props: {
    questions: {
      type: Array,
      required: true,
    },
    gameId: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      localQuestions: [],
      editingId: null,
      showNewForm: false,
    };
  },
  computed: {
    emptyQuestion() {
      return {
        question: '',
        answerquestion: '',
        type: 'text',
        options: [],
        answer: '',
        imageUrl: '',
        audioUrl: '',
        coordinates: { lat: null, lon: null }
      };
    }
  },
  watch: {
    questions: {
      handler(newVal) {
        this.localQuestions = [...newVal];
      },
      immediate: true
    }
  },
  methods: {
    toggleEdit(question) {
      this.editingId = this.editingId === question._id ? null : question._id;
      this.showNewForm = false; // falls offenes neues Formular
    },
    startNewForm() {
      this.editingId = null; // evtl. offenes Edit-Formular schließen
      this.showNewForm = true;
    },
    handleSave(updatedQuestion) {
      const index = this.localQuestions.findIndex(q => q._id === updatedQuestion._id);
      if (index !== -1) {
        this.localQuestions.splice(index, 1, updatedQuestion);
      }
      this.editingId = null;
      this.$emit('save', updatedQuestion);
    },
    handleNewSave(newQuestion) {
      this.localQuestions.push(newQuestion);
      this.showNewForm = false;
      this.$emit('save', newQuestion);

      this.$nextTick(() => {
        const lastItem = this.$el.querySelector('.question-card:last-child');
        if (lastItem) {
          lastItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    },
    async onDragEnd() {
      const reordered = this.localQuestions.map(q => ({ _id: q._id }));
      try {
        await apiService.updateQuestionOrder(this.gameId, reordered);
        this.$emit('reorder', [...this.localQuestions]);
      } catch (err) {
        console.error('❌ Fehler beim Sortieren der Fragen:', err);
      }
    }
  }
};
</script>
