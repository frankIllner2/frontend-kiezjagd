<template>
  <div class="question-list">
    <draggable
      v-model="localQuestions"
      item-key="_id"
      handle=".question-header"
      @end="onDragEnd"
      class="questions-container"
      ref="qContainer"
    >
      <template #header></template>
      <template #item="{ element: question, index }">
        <div class="question-card" :data-id="question._id">
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
    questions: { type: Array, required: true },
    gameId: { type: String, required: true },
  },
  data() {
    return {
      localQuestions: [],
      editingId: null,
      showNewForm: false,
      lastEditedId: null, // Karte, zu der wir zurück wollen
      stickRaf: null,     // RAF-Loop-ID für Scroll-Lock (ohne Unterstrich)
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
        coordinates: { lat: null, lon: null },
      };
    },
  },
  watch: {
    questions: {
      immediate: true,
      handler(newVal) {
        const safe = Array.isArray(newVal) ? newVal : [];
        console.log('%c[DEBUG] watch questions → len:', 'color:#888', safe.length);
        this.localQuestions = [...safe];

        // Nach Prop-Refresh: Karte erneut anscrollen + kurz „festhalten“ (Fenster-Scroll)
        this.$nextTick(() => {
          if (this.lastEditedId) {
            const target = this.scrollToCard(this.lastEditedId); // returns target Y
            if (typeof target === 'number') {
              this.forceStickWindow(target, { ms: 400, tolerance: 2 });
              this.focusCard(this.lastEditedId);
            }
          }
        });
      },
    },
  },
  mounted() {
    console.log('%c[DEBUG] mounted → localQuestions:', 'color:#888', this.localQuestions.length);
  },
  beforeUnmount() { // Vue 3 kompatibel
    if (this.stickRaf) cancelAnimationFrame(this.stickRaf);
  },
  methods: {
    // --- Card helper ---
    cardElById(id) {
      return this.$el.querySelector(`.question-card[data-id="${id}"]`) || null;
    },

    /**
     * Scrollt das FENSTER so, dass die Karte ~topPadding unter dem Viewport-Top steht.
     * Gibt das gesetzte Ziel (pageYOffset) zurück.
     */
    scrollToCard(id, { topPadding = 12 } = {}) {
      const card = this.cardElById(id);
      if (!card) {
        console.warn('[DEBUG scrollToCard] Karte nicht gefunden', id);
        return null;
      }
      const rect = card.getBoundingClientRect();
      const pageY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const target = Math.max(rect.top + pageY - topPadding, 0);
      window.scrollTo(0, target); // WICHTIG: KEIN smooth
      console.log('%c[DEBUG scrollToCard]', 'color:cyan', { id, target: target.toFixed(1), movedBy: (target - pageY).toFixed(1) });
      return target;
    },

    /**
     * Hält den Fenster-Scroll kurz stabil (gegen nachlaufende Smooth-Scrolls/Focus-Jumps).
     * - Deaktiviert temporär 'scroll-behavior: smooth' auf <html>
     * - Korrigiert jeden Frame auf 'target', wenn Abweichung > tolerance
     */
    forceStickWindow(target, { ms = 400, tolerance = 1 } = {}) {
      const root = document.documentElement;
      const start = performance.now();

      // smooth scrolling temporär ausschalten
      const prevBehavior = root.style.scrollBehavior || '';
      root.style.scrollBehavior = 'auto';

      const step = (now) => {
        const elapsed = now - start;
        const current = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const diff = target - current;

        if (Math.abs(diff) > tolerance) {
          window.scrollTo(0, target);
        }

        if (elapsed < ms) {
          this.stickRaf = requestAnimationFrame(step);
        } else {
          root.style.scrollBehavior = prevBehavior;
          this.stickRaf = null;
        }
      };

      if (this.stickRaf) cancelAnimationFrame(this.stickRaf);
      this.stickRaf = requestAnimationFrame(step);
    },

    /**
     * Setzt den Fokus wieder auf die Karte/den Edit-Button (ohne Scroll).
     * Verhindert Browser-Autoscroll zu Elementen am Seitenende.
     */
    focusCard(id) {
      const btn = this.$el.querySelector(`.question-card[data-id="${id}"] .btn-action.btn-edit`);
      if (btn && typeof btn.focus === 'function') {
        try { btn.focus({ preventScroll: true }); } catch { btn.focus(); }
        return true;
      }
      const card = this.cardElById(id);
      if (card) {
        const prev = card.getAttribute('tabindex');
        card.setAttribute('tabindex', '-1');
        try { card.focus({ preventScroll: true }); } catch { card.focus(); }
        requestAnimationFrame(() => {
          if (prev === null) card.removeAttribute('tabindex');
          else card.setAttribute('tabindex', prev);
        });
        return true;
      }
      return false;
    },

    // --- UI Actions ---
    toggleEdit(question) {
      this.editingId = this.editingId === question._id ? null : question._id;
      if (this.editingId) {
        this.lastEditedId = this.editingId;
        this.$nextTick(() => {
          const target = this.scrollToCard(this.lastEditedId);
          if (typeof target === 'number') {
            this.forceStickWindow(target, { ms: 200, tolerance: 2 });
            this.focusCard(this.lastEditedId);
          }
        });
      }
      this.showNewForm = false;
    },

    startNewForm() {
      this.editingId = null;
      this.showNewForm = true;
    },

    handleSave(updatedQuestion) {
      if (updatedQuestion && updatedQuestion._id) {
        this.lastEditedId = updatedQuestion._id;
      }

      const index = this.localQuestions.findIndex(q => q._id === updatedQuestion._id);
      if (index !== -1) this.localQuestions.splice(index, 1, updatedQuestion);

      this.editingId = null;
      this.$emit('save', updatedQuestion);

      // 1) Nach lokalem Re-Render scrollen + kurz „festhalten“ + Fokus setzen
      this.$nextTick(() => {
        const target = this.scrollToCard(this.lastEditedId);
        if (typeof target === 'number') this.forceStickWindow(target, { ms: 300, tolerance: 2 });
        this.focusCard(this.lastEditedId);
      });
      // 2) Nach Parent-Refetch (watch) wird es nochmal ausgeführt (mit 400ms Lock)
    },

    handleNewSave(newQuestion) {
      this.localQuestions.push(newQuestion);
      this.showNewForm = false;
      this.$emit('save', newQuestion);

      this.$nextTick(() => {
        const lastItem = this.$el.querySelector('.question-card:last-child');
        if (lastItem) lastItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    },
  },
};
</script>
