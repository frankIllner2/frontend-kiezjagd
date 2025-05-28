<template>
  <div class="question-list">
    <draggable
      v-model="localQuestions"
      item-key="_id"
      handle=".question-header"
      @end="onDragEnd"
      class="questions-container"
    >
      <!-- optional: leerer header-Slot zur Vermeidung von Fehlern -->
      <template #header></template>

      <!-- Haupt-Slot -->
      <template #item="{ element: question, index }">
        <div class="question-card">
          <div class="question-header">
            <h4>{{ index + 1 }} {{ question.type === "anweisung" ? "Anweisung" : (question.type === "next" ? "Weiter" : "Frage") }}</h4>
          </div>

          <div class="question-content">
            <p>
              <strong>{{ question.type === "anweisung" ? "Anweisung" : (question.type === "next" ? "Weiter" : "Frage") }}:</strong>
              {{ question.question }}
            </p>

            <p v-if="question.type === 'text'"><strong>Antwort:</strong> {{ question.answer }}</p>

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
                  <span v-if="option.correct"> ✅</span>
                </li>
              </ul>
            </div>

            <p v-if="question.type === 'anweisung'">
              <strong>Koordinaten:</strong> {{ question.coordinates.lat }}, {{ question.coordinates.lon }}
            </p>

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
      </template>
    </draggable>

    <button @click="$emit('add')" class="btn-add">Neue Frage hinzufügen</button>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import apiService from '@/services/apiService';

export default {
  components: { draggable },
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
      localQuestions: []
    };
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
    handleEdit(question) {
      this.$emit('edit', { ...question });
      this.$nextTick(() => {
        const editForm = document.getElementById('edit-question-container');
        if (editForm) {
          editForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
