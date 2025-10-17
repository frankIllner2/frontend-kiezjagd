<template>
  <div class="speech-controls" role="group" aria-label="Sprachwiedergabe">
    <!-- Play/Pause -->
    <button
      class="speech-btn"
      @click="onPlayPause"
      :disabled="!textSanitized || isStarting"
      :aria-pressed="isSpeaking && !isPaused"
      :aria-label="isPaused || (!isSpeaking && currentIndex>0) ? 'Weiterlesen' : (isSpeaking ? 'Pausieren' : 'Vorlesen starten')"
      title="Play/Pause"
    >
      <font-awesome-icon
        :icon="isSpeaking ? (isPaused ? 'play' : 'pause') : 'play'"
        :class="{ 'is-speaking': isSpeaking && !isPaused }"
      />
    </button>

    <!-- Stop -->
    <button
      class="speech-btn stop"
      @click="onStop"
      :disabled="!isSpeaking && !isPaused && currentIndex === 0"
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
  props: { text: { type: String, required: true } },
  data() {
    return {
      // Playback
      isSpeaking: false,
      isPaused: false,
      isStarting: false,
      selectedVoice: null,
      currentUtterance: null,

      // Queue / Fortschritt
      sentences: [],
      currentIndex: 0, // Satzindex, ab dem gelesen wird

      // Platform
      platform: {
        isAndroid: /Android/i.test(navigator.userAgent),
      },

      // Listener
      voicesChangedHandler: null,
    };
  },
  computed: {
    textSanitized() {
      return this.sanitizeText(this.text || "");
    },
  },
  mounted() {
    const load = () => this.loadVoices();
    if (speechSynthesis.getVoices().length > 0) load();
    this.voicesChangedHandler = load;
    speechSynthesis.onvoiceschanged = this.voicesChangedHandler;

    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    // Vorab splitten
    this.sentences = this.splitIntoSentences(this.textSanitized);
  },
  beforeUnmount() {
    try { speechSynthesis.cancel(); } catch (e) { /* noop */ }
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    if (speechSynthesis.onvoiceschanged === this.voicesChangedHandler) {
      speechSynthesis.onvoiceschanged = null;
    }
  },
  watch: {
    text() {
      // Bei Textwechsel sauber neu aufsetzen
      this.onStop();
      this.sentences = this.splitIntoSentences(this.textSanitized);
      this.currentIndex = 0;
    },
  },
  methods: {
    sanitizeText(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
    },

    splitIntoSentences(plain) {
      if (!plain) return [];
      // robuste Satztrennung: Punkt, !, ?, … + evtl. Anführungszeichen/ Klammern
      const parts = [];
      const regex = /[^.!?…]+(?:[.!?…]+(?:['")\]]*)|\s*$)/g;
      let m;
      while ((m = regex.exec(plain)) !== null) {
        const s = m[0].trim();
        if (s) parts.push(s);
      }
      return parts.length ? parts : [plain];
    },

    loadVoices() {
      const voices = window.speechSynthesis.getVoices();
      const de = voices.filter(v => (v.lang || "").toLowerCase().startsWith("de"));
      this.selectedVoice =
        voices.find(v => v.name === "Google Deutsch") ||
        de[0] || voices[0] || null;
    },

    wait(ms) { return new Promise(r => setTimeout(r, ms)); },

    async safeCancel(timeoutMs = 500) {
      try { speechSynthesis.cancel(); } catch (e) {void e; }
      const t0 = performance.now();
      while ((speechSynthesis.speaking || speechSynthesis.pending) && (performance.now() - t0) < timeoutMs) {
        await this.wait(16);
      }
      try { speechSynthesis.cancel(); } catch (e) {void e; }
      // Android braucht oft etwas mehr „Luft“ nach cancel()
      if (this.platform.isAndroid) await this.wait(100);
    },

    createUtterance(text) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "de-DE";
      u.rate = 1.05;
      u.pitch = 1.2;
      u.volume = 1;
      if (this.selectedVoice) u.voice = this.selectedVoice;

      u.onstart = () => {
        this.isStarting = false;
        this.isSpeaking = true;
        this.isPaused = false;
      };
      u.onend = () => {
        // Wenn nicht pausiert/gestoppt, zum nächsten Satz springen
        if (!this.isPaused) {
          this.currentUtterance = null;
          this.isSpeaking = false;
          if (this.currentIndex < this.sentences.length - 1) {
            this.currentIndex += 1;
            // Auto-Continue für lange Texte? → hier bewusst NEIN, da Button-Player
          }
        }
      };
      u.onerror = () => {
        this.currentUtterance = null;
        this.isSpeaking = false;
        // Kein Index-Advance bei Fehler
      };
      return u;
    },

    async speakSentenceAt(index) {
      if (index < 0 || index >= this.sentences.length) return;
      if (this.isStarting) return;
      this.isStarting = true;

      await this.safeCancel();
      try { speechSynthesis.resume(); } catch (e) {void e; }

      const utter = this.createUtterance(this.sentences[index]);
      this.currentUtterance = utter;

      try {
        speechSynthesis.speak(utter);
      } catch (e) {
        // minimal verzögert erneut versuchen
        await this.wait(40);
        try { speechSynthesis.speak(utter); } catch (_) {
          this.isStarting = false;
          this.isSpeaking = false;
        }
      }
    },

    async startOrResume() {
      // Wenn bereits gespielt und pausiert → exakt am Satz fortsetzen
      if (this.isPaused && this.currentIndex < this.sentences.length) {
        await this.speakSentenceAt(this.currentIndex);
        return;
      }
      // sonst neu ab currentIndex (0 beim ersten Mal)
      await this.speakSentenceAt(this.currentIndex);
    },

    async onPlayPause() {
      if (!this.isSpeaking && !this.isPaused) {
        // Start
        await this.startOrResume();
        return;
      }
      if (this.isPaused) {
        // Resume (gleicher Satz neu starten)
        await this.startOrResume();
        return;
      }
      // Pause: wir stoppen hart, merken den aktuellen Satzindex, ohne ihn zu erhöhen
      await this.safeCancel();
      this.isPaused = true;
      this.isSpeaking = false;
      // currentIndex bleibt unverändert → Resume liest denselben Satz erneut
    },

    async onStop() {
      await this.safeCancel();
      this.isStarting = false;
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.currentIndex = 0; // zurück an den Anfang
    },

    handleVisibilityChange() {
      // Beim Tab-Wechsel auf Android ist echtes Pause/Resume unzuverlässig → weich pausieren
      if (document.visibilityState !== "visible" && this.isSpeaking) {
        this.onPlayPause();
      }
    },
  },
};
</script>

<style scoped lang="scss">
@use "sass:color";

$primary-text-color: #355b4c;
$secondary-text-color: #FAC227;

/* Container: explizit background-color & border, robust gegen UA-Styles */
.speech-controls {
  display: inline-flex;
  align-items: center;
  background-color: #f9f9f9; /* explizit */
  border: 1px solid color.adjust($primary-text-color, $lightness: 35%);
  border-radius: 6px;
  padding: 0.18rem 0.35rem; /* flach, aber klar sichtbar */
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
  box-sizing: border-box;

  /* Fallback, falls flex-gap nicht greift (einige WebViews) */
  gap: 0.35rem;
}
.speech-controls > .speech-btn + .speech-btn { /* gap-Fallback */
  margin-left: 0.35rem;
}

.speech-btn {
  -webkit-appearance: none; /* UA-Styles killen (Pixel/Chrome) */
  appearance: none;
  background: none;
  border: none;
  color: $primary-text-color;
  line-height: 1;
  padding: 0; /* optisch kompakt */
  /* sichtbares Icon klein, aber guter Hit-Bereich: */
  font-size: 1.1rem;
  position: relative;
  cursor: pointer;

  /* unsichtbare Touch-Fläche (≈44px) */
  &::before {
    content: "";
    position: absolute;
    inset: -0.5rem; /* ~8px Puffer um das Icon herum */
  }

  &:hover { color: $secondary-text-color; }
  &:focus-visible {
    outline: 2px solid $secondary-text-color;
    outline-offset: 2px;
    border-radius: 4px;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.speech-btn.stop {
  color: $secondary-text-color;
  &:hover { color: color.adjust($secondary-text-color, $lightness: -12%); }
}

.is-speaking { color: $secondary-text-color; }
</style>
