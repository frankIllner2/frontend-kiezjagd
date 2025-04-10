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
      isSpeaking: false,
      selectedVoice: null
    };
  },
  mounted() {
    this.loadVoices();
    window.speechSynthesis.onvoiceschanged = this.loadVoices;
  },
  methods: {
    loadVoices() {
      const voices = window.speechSynthesis.getVoices();
      console.log("🎙️ Verfügbare Stimmen:", voices);

      this.selectedVoice = voices.find(voice => voice.name === "Google Deutsch") ||
        voices.find(voice => voice.name === "Microsoft Katja - German (Germany)") ||
        voices.find(voice => voice.name === "Microsoft Hedda - German (Germany)") ||
        voices.find(voice => voice.name === "Microsoft Stefan - German (Germany)");

      console.log("✅ Gewählte Stimme:", this.selectedVoice?.name || "Standard");
    },

    /**
     * Wandelt HTML in reinen Text um, damit keine Tags vorgelesen werden.
     */
    sanitizeText(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },

    speakText() {
      if (!this.text) return;

      window.speechSynthesis.cancel();

      const plainText = this.sanitizeText(this.text);

      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.lang = "de-DE";
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

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
}
.speech-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
