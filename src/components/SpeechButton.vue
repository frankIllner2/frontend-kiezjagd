<template>
  <button @click="speakText" :disabled="isSpeaking" class="speech-btn">
    <font-awesome-icon
      icon="volume-up"
      :class="{ 'is-speaking': isSpeaking }"
    />
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
    if (speechSynthesis.getVoices().length > 0) {
      this.loadVoices();
    } else {
      speechSynthesis.onvoiceschanged = this.loadVoices;
    }
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

    sanitizeText(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },

    speakText() {
      // Toggle-Funktion: Wenn bereits gesprochen wird, dann abbrechen
      if (this.isSpeaking || speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        this.isSpeaking = false;
        return;
      }

      if (!this.text) return;

      const plainText = this.sanitizeText(this.text);

      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.lang = "de-DE";
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
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

.speech-btn svg {
  color: #355b4c;
  margin-left: 5px;
}

/* 🎯 Wiggle-Animation auf das gerenderte SVG, wenn über .is-speaking */
:v-deep(.is-speaking > svg) {
  animation: wiggle 0.6s ease-in-out infinite;
  transform-origin: center;
}

.speech-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<style>
@keyframes wiggle {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(5deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-5deg); }
  100% { transform: rotate(0deg); }
}
</style>
