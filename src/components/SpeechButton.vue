<template>
  <button @click="speakText" :disabled="isSpeaking" class="speech-btn">
    <font-awesome-icon icon="volume-up" :class="{ 'is-speaking': isSpeaking }" />
  </button>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isSpeaking: false,
      selectedVoice: null,
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

      this.selectedVoice =
        voices.find((voice) => voice.name === "Google Deutsch") ||
        voices.find((voice) => voice.name === "Microsoft Katja - German (Germany)") ||
        voices.find((voice) => voice.name === "Microsoft Hedda - German (Germany)") ||
        voices.find((voice) => voice.name === "Microsoft Stefan - German (Germany)");

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
      utterance.rate = 1.05;
      utterance.pitch = 1.2;
      utterance.volume = 1;

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      this.isSpeaking = true;

      utterance.onend = () => {
        this.isSpeaking = false;
      };

      window.speechSynthesis.speak(utterance);
    },
  },
};
</script>
