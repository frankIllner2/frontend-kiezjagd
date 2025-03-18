<template>
    <button @click="speakText" :disabled="isSpeaking" class="speech-btn">
      <span v-if="isSpeaking">🔊...</span>
      <span v-else>🔊</span>
    </button>
  </template>
  
  <script>
  export default {
    props: {
      text: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        isSpeaking: false
      };
    },

    methods: {
      speakText() {
        if (!this.text) return;
  
        // Falls bereits etwas gesprochen wird, stoppen
        window.speechSynthesis.cancel();
  
        const utterance = new SpeechSynthesisUtterance(this.text);
        utterance.lang = "de-DE"; // Deutsche Sprache
        utterance.rate = 1; // Normale Geschwindigkeit
  
        this.isSpeaking = true;
        utterance.onend = () => {
          this.isSpeaking = false;
        };
  
        window.speechSynthesis.speak(utterance);
      }
    }
  };
  </script>
  
  <style scoped>
  .speech-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    margin-left: 8px;
  }
  .speech-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  </style>
  