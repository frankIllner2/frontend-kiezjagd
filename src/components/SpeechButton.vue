<template>
  <div class="speech-controls">
    <!-- Play/Pause -->
    <button
      @click="onPlayPause"
      :disabled="!textSanitized"
      class="speech-btn"
      :aria-pressed="isSpeaking"
      :aria-label="isPaused ? 'Vorlesen fortsetzen' : (isSpeaking ? 'Vorlesen pausieren' : 'Vorlesen starten')"
      title="Play/Pause"
    >
      <font-awesome-icon
        :icon="isSpeaking ? (isPaused ? 'play' : 'pause') : 'play'"
        :class="{ 'is-speaking': isSpeaking && !isPaused }"
      />
    </button>

    <!-- Stop -->
    <button
      @click="onStop"
      :disabled="!isSpeaking"
      class="speech-btn stop"
      aria-label="Vorlesen stoppen"
      title="Stop"
    >
      <font-awesome-icon icon="stop" />
    </button>
  </div>
</template>

<script>
export default {
  name: "SpeechButton",
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isSpeaking: false,
      isPaused: false,
      selectedVoice: null,
      currentUtterance: null,
    };
  },
  computed: {
    textSanitized() {
      return this.sanitizeText(this.text || "");
    },
  },
  mounted() {
    if (speechSynthesis.getVoices().length > 0) {
      this.loadVoices();
    } else {
      speechSynthesis.onvoiceschanged = this.loadVoices;
    }

    // Sicherheitsnetz: Wenn die Seite den Fokus verliert & Browser automatisch pausiert
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  },
  beforeUnmount() {
    // Aufräumen
    speechSynthesis.cancel();
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
  },
  watch: {
    // Wenn sich der Text ändert und wir sprechen noch -> stoppen, damit der neue Text sauber gelesen werden kann
    text() {
      if (this.isSpeaking) {
        this.onStop();
      }
    },
  },
  methods: {
    loadVoices() {
      const voices = window.speechSynthesis.getVoices();
      // Optional: Filter auf deutsche Stimmen – damit die Auswahl stabiler ist
      const deVoices = voices.filter(v => v.lang?.toLowerCase().startsWith("de"));
      // Deine bevorzugten Kandidaten:
      this.selectedVoice =
        voices.find((v) => v.name === "Google Deutsch") ||
        voices.find((v) => v.name === "Microsoft Katja - German (Germany)") ||
        voices.find((v) => v.name === "Microsoft Hedda - German (Germany)") ||
        voices.find((v) => v.name === "Microsoft Stefan - German (Germany)") ||
        deVoices[0] || // Fallback: erste deutsche Stimme
        voices[0] ||   // Notfall-Fallback
        null;

      // Debug
      // console.log("🎙️ Verfügbare Stimmen:", voices);
      // console.log("✅ Gewählte Stimme:", this.selectedVoice?.name || "Standard");
    },

    sanitizeText(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return (div.textContent || div.innerText || "").trim();
    },

    createUtterance() {
      const utter = new SpeechSynthesisUtterance(this.textSanitized);
      utter.lang = "de-DE";
      utter.rate = 1.05;
      utter.pitch = 1.2;
      utter.volume = 1;

      if (this.selectedVoice) {
        utter.voice = this.selectedVoice;
      }

      utter.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
      };

      utter.onerror = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
      };

      return utter;
    },

    start() {
      if (!this.textSanitized) return;

      // Falls noch etwas in der Queue hängt, vorher leeren
      if (speechSynthesis.speaking || speechSynthesis.pending) {
        speechSynthesis.cancel();
      }

      this.currentUtterance = this.createUtterance();
      this.isSpeaking = true;
      this.isPaused = false;

      window.speechSynthesis.speak(this.currentUtterance);
    },

    pause() {
      if (this.isSpeaking && !this.isPaused) {
        try {
          speechSynthesis.pause();
          this.isPaused = true;
        } catch (e) {
          // manche Browser blockieren pause(), dann fallback: cancel
          speechSynthesis.cancel();
          this.isSpeaking = false;
          this.isPaused = false;
          this.currentUtterance = null;
        }
      }
    },

    resume() {
      if (this.isSpeaking && this.isPaused) {
        try {
          speechSynthesis.resume();
          this.isPaused = false;
        } catch (e) {
          // Notfall: wenn resume nicht klappt, neu starten
          this.start();
        }
      }
    },

    onPlayPause() {
      if (!this.isSpeaking) {
        // Noch nichts läuft -> Start
        this.start();
        return;
      }

      // Läuft bereits:
      if (this.isPaused) {
        this.resume();
      } else {
        this.pause();
      }
    },

    onStop() {
      if (this.isSpeaking || speechSynthesis.speaking || speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
    },

    handleVisibilityChange() {
      // Wenn Tab wechselt, pausieren einige Browser automatisch -> UI-Status synchronisieren
      if (document.visibilityState !== "visible" && this.isSpeaking) {
        this.isPaused = true;
      }
    },
  },
};
</script>

<style scoped lang="scss">
@use "sass:color";

/* Farben */
$primary-text-color: #355b4c;
$secondary-text-color: #FAC227;

.speech-controls {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #f9f9f9;
  border: 1px solid $secondary-text-color;
  border-radius: 6px;
  padding: 0.2rem 0.35rem; /* ✅ kompakter Hintergrund */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.speech-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: $primary-text-color;

  /* 👉 Touchfläche bleibt groß */
  width: 2.25rem;   /* ≈ 36px */
  height: .5rem;  /* fingerfreundlich */
  font-size: 1.3rem; /* Icon-Größe */
  cursor: pointer;

  transition: color 0.25s ease, transform 0.15s ease;

  &:hover {
    color: $secondary-text-color;
    transform: scale(1.05);
  }

  &:focus-visible {
    outline: 2px solid $secondary-text-color;
    outline-offset: 2px;
    border-radius: 4px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.speech-btn.stop {
  color: $secondary-text-color;

  &:hover {
    color: color.adjust($secondary-text-color, $lightness: -15%);
  }
}

.is-speaking {
  color: $secondary-text-color;
}

@keyframes pulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.08); }
}
</style>
