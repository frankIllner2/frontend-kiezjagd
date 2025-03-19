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
        // Falls Stimmen noch nicht geladen sind, beim Wechsel prüfen
        window.speechSynthesis.onvoiceschanged = this.loadVoices;
    },
    methods: {
      loadVoices() {
        const voices = window.speechSynthesis.getVoices();
        console.log("🎙️ Verfügbare Stimmen:", voices);

        // Priorität: Google Deutsch → Microsoft Katja → Microsoft Hedda → Microsoft Stefan
        this.selectedVoice = voices.find(voice => voice.name === "Google Deutsch") ||
                            voices.find(voice => voice.name === "Microsoft Katja - German (Germany)") ||
                            voices.find(voice => voice.name === "Microsoft Hedda - German (Germany)") ||
                            voices.find(voice => voice.name === "Microsoft Stefan - German (Germany)"); 

        console.log("✅ Gewählte Stimme:", this.selectedVoice?.name || "Standard");
        },
      speakText() {
        if (!this.text) return;
  
        // Falls bereits etwas gesprochen wird, stoppen
        window.speechSynthesis.cancel();
  
        const utterance = new SpeechSynthesisUtterance(this.text);
        utterance.lang = "de-DE"; // Deutsche Sprache
        utterance.rate = 0.8; // Normale Geschwindigkeit
        utterance.pitch = 1; // Tonhöhe (1 = normal)
        utterance.volume = 1; // Lautstärke (1 = 100%)
  
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
    margin-left: 8px;
  }
  .speech-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  </style>
  