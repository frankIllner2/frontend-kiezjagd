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
  props: {
    text: { type: String, required: true },
    /** Wenn true, wird nach einem Klick automatisch der komplette Text vorgelesen (Satz-Queue). */
    autoContinue: { type: Boolean, default: true },
  },
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
      currentIndex: 0, // aktueller Satzindex

      // Platform
      platform: { isAndroid: /Android/i.test(navigator.userAgent) },

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

    // Text vorbereiten
    this.sentences = this.splitIntoSentences(this.textSanitized);
  },
  beforeUnmount() {
    try { speechSynthesis.cancel(); } catch (e) { void e; }
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    if (speechSynthesis.onvoiceschanged === this.voicesChangedHandler) {
      speechSynthesis.onvoiceschanged = null;
    }
  },
  watch: {
    text() {
      // Bei Textwechsel komplett neu initialisieren
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
      // robuste Satztrennung: Punkt, !, ?, … (+ evtl. Anführungs-/Klammerabschluss)
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
      try { speechSynthesis.cancel(); } catch (e) { void e; }
      const t0 = performance.now();
      while ((speechSynthesis.speaking || speechSynthesis.pending) && (performance.now() - t0) < timeoutMs) {
        await this.wait(16);
      }
      try { speechSynthesis.cancel(); } catch (e) { void e; }
      if (this.platform.isAndroid) await this.wait(100); // Android mag etwas „Luft“ nach cancel()
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
        // Wenn nicht pausiert/gestoppt und AutoContinue an: nächsten Satz automatisch starten
        if (this.autoContinue && !this.isPaused) {
          if (this.currentIndex < this.sentences.length - 1) {
            this.currentIndex += 1;
            // im nächsten Tick sprechen (kein rekursiver Stack)
            setTimeout(() => { this.speakSentenceAt(this.currentIndex); }, 0);
            return;
          }
        }
        // Ende erreicht oder pausiert → Status aktualisieren
        this.currentUtterance = null;
        this.isSpeaking = false;
      };

      u.onerror = () => {
        this.currentUtterance = null;
        this.isSpeaking = false;
      };

      return u;
    },

    async speakSentenceAt(index) {
      if (index < 0 || index >= this.sentences.length) return;
      if (this.isStarting) return;
      this.isStarting = true;

      await this.safeCancel();
      try { speechSynthesis.resume(); } catch (e) { void e; }

      const utter = this.createUtterance(this.sentences[index]);
      this.currentUtterance = utter;

      try {
        speechSynthesis.speak(utter);
      } catch (e1) {
        void e1;
        await this.wait(40);
        try { speechSynthesis.speak(utter); } catch (e2) { void e2; this.isStarting = false; this.isSpeaking = false; }
      }
    },

    async startOrResume() {
      // Wenn pausiert → gleichen Satz erneut starten
      if (this.isPaused && this.currentIndex < this.sentences.length) {
        await this.speakSentenceAt(this.currentIndex);
        return;
      }
      // ansonsten ab aktuellem Index beginnen (0 beim ersten Mal)
      await this.speakSentenceAt(this.currentIndex);
    },

    async onPlayPause() {
      if (!this.isSpeaking && !this.isPaused) {
        // Start
        await this.startOrResume();
        return;
      }
      if (this.isPaused) {
        // Resume → gleicher Satz erneut
        await this.startOrResume();
        return;
      }
      // Pause: hart stoppen, Index bleibt, damit Resume denselben Satz neu beginnt
      await this.safeCancel();
      this.isPaused = true;
      this.isSpeaking = false;
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
      // Beim Tab-Wechsel weich pausieren
      if (document.visibilityState !== "visible" && this.isSpeaking) {
        // entspricht Pause-Verhalten
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

/* Explizit gestylt (Pixel/WebView sicher): */
.speech-controls {
  display: inline-flex;
  align-items: center;
  background-color: #f9f9f9;
  border: 1px solid color.adjust($primary-text-color, $lightness: 35%);
  border-radius: 6px;
  padding: 0.6rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
  box-sizing: border-box;
  gap: 1.4rem;
  display: flex;
  justify-self: center;
  align-self: center;
  margin: 1rem auto;
  width: fit-content;
}
.speech-controls > .speech-btn + .speech-btn { margin-left: 0.35rem; }

.speech-btn {
  -webkit-appearance: none;
  appearance: none;
  background: none;
  border: none;
  color: $primary-text-color;
  line-height: 1;
  padding: 0;            /* optisch kompakt */
  font-size: 1.3rem;     /* Icon-Größe */
  position: relative;
  cursor: pointer;

  /* Unsichtbare Touch-Fläche (≈44px) */
  &::before {
    content: "";
    position: absolute;
    inset: -0.5rem;
  }

  &:hover { color: $secondary-text-color; }
  &:focus-visible {
    outline: 2px solid $secondary-text-color;
    outline-offset: 2px;
    border-radius: 4px;
  }

  &:disabled { opacity: 0.45; cursor: not-allowed; }
}

.speech-btn.stop {
  color: $secondary-text-color;
  &:hover { color: color.adjust($secondary-text-color, $lightness: -12%); }
}

.is-speaking { color: $secondary-text-color; }
</style>
