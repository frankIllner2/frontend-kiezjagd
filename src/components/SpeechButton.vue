<template>
  <div class="speech-controls">
    <!-- Play/Pause -->
    <button
      @click="onPlayPause"
      class="speech-btn"
      :disabled="!textSanitized || isStarting"
      :aria-pressed="isSpeaking && !isPaused"
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
      class="speech-btn stop"
      :disabled="!isSpeaking && !isStarting && !isPaused"
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
  },
  data() {
    return {
      isSpeaking: false,
      isPaused: false,
      isStarting: false,
      selectedVoice: null,
      currentUtterance: null,
      voicesChangedHandler: null,
      platform: {
        isAndroid: /Android/i.test(navigator.userAgent),
        isiOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
      },
      lastBoundaryIndex: 0,  // Index der zuletzt gesprochenen Stelle
      resumeFromIndex: 0,    // Wo beim Fortsetzen wieder eingestiegen wird
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
    window.addEventListener("pagehide", this.onStop, { passive: true });
  },
  beforeUnmount() {
    try { speechSynthesis.cancel(); } catch (e) { void e; }
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    window.removeEventListener("pagehide", this.onStop);
    if (speechSynthesis.onvoiceschanged === this.voicesChangedHandler) {
      speechSynthesis.onvoiceschanged = null;
    }
  },
  watch: {
    text() {
      // Bei Textwechsel stoppen & Indizes zurücksetzen
      if (this.isSpeaking || this.isPaused || this.isStarting) {
        this.onStop();
      }
      this.lastBoundaryIndex = 0;
      this.resumeFromIndex = 0;
    },
  },
  methods: {
    sanitizeText(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return (div.textContent || div.innerText || "").trim();
    },

    loadVoices() {
      const voices = window.speechSynthesis.getVoices();
      const deVoices = voices.filter(v => v.lang?.toLowerCase().startsWith("de"));
      this.selectedVoice =
        voices.find(v => v.name === "Google Deutsch") ||
        voices.find(v => v.name?.includes("Microsoft Katja")) ||
        voices.find(v => v.name?.includes("Microsoft Hedda")) ||
        voices.find(v => v.name?.includes("Microsoft Stefan")) ||
        deVoices[0] ||
        voices[0] ||
        null;
    },

    waitFor(ms) {
      return new Promise(res => setTimeout(res, ms));
    },

    async safeCancel(timeoutMs = 400) {
      try { speechSynthesis.cancel(); } catch (e) { void e; }
      const t0 = performance.now();
      while ((speechSynthesis.speaking || speechSynthesis.pending) && (performance.now() - t0) < timeoutMs) {
        await this.waitFor(16);
      }
      try { speechSynthesis.cancel(); } catch (e) { void e; }
      await this.waitFor(10);
    },

    createUtterance(txt, offset = 0) {
      const utter = new SpeechSynthesisUtterance(txt);
      utter.lang = "de-DE";
      utter.rate = 1.05;
      utter.pitch = 1.2;
      utter.volume = 1;
      if (this.selectedVoice) utter.voice = this.selectedVoice;

      // Fortschritt tracken: wo sind wir im Gesamttext?
      utter.onboundary = (ev) => {
        // ev.charIndex ist relativ zu 'txt'; addiere offset, um im Gesamttext zu bleiben
        const absoluteIndex = offset + (ev.charIndex ?? 0);
        // nur erhöhen (einige Browser feuern boundary mehrfach)
        if (absoluteIndex > this.lastBoundaryIndex) {
          this.lastBoundaryIndex = absoluteIndex;
        }
      };

      utter.onstart = () => {
        this.isStarting = false;
        this.isSpeaking = true;
        this.isPaused = false;
      };
      utter.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
      };
      utter.onerror = () => {
        this.isStarting = false;
        this.isSpeaking = false;
        this.currentUtterance = null;
      };
      return utter;
    },

    async startFromIndex(index = 0) {
      const full = this.textSanitized;
      if (!full) return;
      if (index >= full.length) {
        // Nichts mehr zu lesen
        this.isPaused = false;
        this.isSpeaking = false;
        return;
      }
      if (this.isStarting) return;
      this.isStarting = true;

      await this.safeCancel();
      if (this.platform.isAndroid) {
        await this.waitFor(60);
      }
      try { speechSynthesis.resume(); } catch (e) { void e; }

      const slice = full.slice(index);
      const utter = this.createUtterance(slice, index);
      this.currentUtterance = utter;

      try {
        speechSynthesis.speak(utter);
      } catch (e1) {
        void e1;
        await this.waitFor(30);
        try { speechSynthesis.speak(utter); } catch (e2) { void e2; this.isStarting = false; }
      }
    },

    async start() {
      this.lastBoundaryIndex = 0;
      this.resumeFromIndex = 0;
      await this.startFromIndex(0);
    },

    // „Weiche“ Pause für Android: Abbrechen + Index merken
    async softPause() {
      // beim Pausieren an der letztem Boundary weitermachen
      this.resumeFromIndex = this.lastBoundaryIndex;
      await this.safeCancel();
      this.isSpeaking = false;
      this.isPaused = true;
    },

    pause() {
      if (this.platform.isAndroid) {
        // Fallback-Strategie für Android
        this.softPause();
        return;
      }
      try {
        if (this.isSpeaking && !this.isPaused) {
          speechSynthesis.pause();
          this.isPaused = true;
        }
      } catch (e) {
        void e;
        // Fallback: SoftPause
        this.softPause();
      }
    },

    resume() {
      if (this.platform.isAndroid) {
        // Fortsetzen durch Neu-Start ab gespeicherter Position
        this.startFromIndex(this.resumeFromIndex || this.lastBoundaryIndex);
        return;
      }
      try {
        if (this.isSpeaking && this.isPaused) {
          speechSynthesis.resume();
          this.isPaused = false;
        } else if (!this.isSpeaking && this.isPaused) {
          // Engine hat wirklich gestoppt → ab letzter Boundary neu starten
          this.startFromIndex(this.resumeFromIndex || this.lastBoundaryIndex);
        } else if (!this.isSpeaking && !this.isPaused) {
          this.start();
        }
      } catch (e) {
        void e;
        this.startFromIndex(this.resumeFromIndex || this.lastBoundaryIndex);
      }
    },

    async onPlayPause() {
      if (!this.isSpeaking && !this.isPaused) {
        await this.start();
        return;
      }
      if (this.isPaused) {
        this.resume();
        return;
      }
      this.pause();
    },

    async onStop() {
      await this.safeCancel();
      this.isStarting = false;
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.lastBoundaryIndex = 0;
      this.resumeFromIndex = 0;
    },

    handleVisibilityChange() {
      if (document.visibilityState !== "visible" && this.isSpeaking) {
        // beim Tab-Wechsel als „weich pausiert“ markieren
        this.isPaused = true;
        this.resumeFromIndex = this.lastBoundaryIndex;
      }
    },
  },
};
</script>
