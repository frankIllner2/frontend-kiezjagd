<template>
  <div v-if="isActive" class="instruction-layer">
    <div class="instruction-content">
      <div class="close-btn" @click="close">
        <img
          src="@/assets/img/icons/show-back.svg"
          alt="Schließen"
          class="close-icon"
        />
      </div>
      <h2>{{ title }}</h2>
      <p>{{ text }}</p>
      <button
        @click="scrollToSection('game-preview-section')"
        class="btn btn--primary"
        id="open-instruction"
      >
        Spiele entdecken
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "InstructionLayer",
  props: {
    isActive: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  methods: {
    close() {
      this.$emit("close");
    },
    scrollToSection(id) {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    },
  },
};
</script>