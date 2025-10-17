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
      :disabled="!isSpeaking && !isStarting"
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
      isStarting: false, // schützt vor Doppelklicks während Start-Handshake
      selectedVoice: null,
      currentUtterance: null,
      voicesChangedHandler: null, // ✅ kein _
      platform: {               // ✅ kein _
        isAndroid: /Android/i.test(navigator.userAgent),
        isiOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
      },
    };
  },
  computed: {
    textSanitized() {
      return this.sanitizeText(this.text || "");
    },
  },
  mounted() {
    const load = () => this.loadVoices();
    if (speechSynthesis.getVoices().length > 0) {
      load();
    }
    this.voicesChangedHandler = load;
    speechSynthesis.onvoiceschanged = this.voicesChangedHandler;

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    window.addEventListener("pagehide", this.onStop, { passive: true });
  },
  beforeUnmount() {
    try {
      speechSynthesis.cancel();
    } catch (e) {
      void e; // ✅ no-empty fixer
    }
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    window.removeEventListener("pagehide", this.onStop);
    if (speechSynthesis.onvoiceschanged === this.voicesChangedHandler) {
      speechSynthesis.onvoiceschanged = null;
    }
  },
  watch: {
    text() {
      if (this.isSpeaking || this.isPaused || this.isStarting) {
        this.onStop();
      }
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
      try { speechSynthesis.cancel(); } catch (e) { void e; } // ✅
      const t0 = performance.now();
      while ((speechSynthesis.speaking || speechSynthesis.pending) && (performance.now() - t0) < timeoutMs) {
        await this.waitFor(16);
      }
      try { speechSynthesis.cancel(); } catch (e) { void e; } // ✅
      await this.waitFor(10);
    },

    createUtterance(txt) {
      const utter = new SpeechSynthesisUtterance(txt);
      utter.lang = "de-DE";
      utter.rate = 1.05;
      utter.pitch = 1.2;
      utter.volume = 1;
      if (this.selectedVoice) utter.voice = this.selectedVoice;

      utter.onstart = () => {
        this.isStarting = false;
        this.isSpeaking = true;
        this.isPaused = false;
      };
      utter.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
      };
      utter.onerror = () => {
        this.isStarting = false;
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
      };
      return utter;
    },

    async start() {
      if (!this.textSanitized) return;
      if (this.isStarting) return;
      this.isStarting = true;

      await this.safeCancel();

      if (this.platform.isAndroid) {
        await this.waitFor(60);
      }

      try { speechSynthesis.resume(); } catch (e) { void e; } // ✅

      const utter = this.createUtterance(this.textSanitized);
      this.currentUtterance = utter;

      try {
        speechSynthesis.speak(utter);
      } catch (e1) {
        void e1; // ✅
        await this.waitFor(30);
        try {
          speechSynthesis.speak(utter);
        } catch (e2) {
          void e2; // ✅
          this.isStarting = false;
          this.isSpeaking = false;
          this.currentUtterance = null;
        }
      }
    },

    pause() {
      try {
        if (this.isSpeaking && !this.isPaused) {
          speechSynthesis.pause();
          this.isPaused = true;
        }
      } catch (e) {
        void e; // ✅
        this.onStop();
      }
    },

    resume() {
      try {
        if (this.isSpeaking && this.isPaused) {
          speechSynthesis.resume();
          this.isPaused = false;
        } else if (!this.isSpeaking && !this.isPaused) {
          this.start();
        }
      } catch (e) {
        void e; // ✅
        this.start();
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
    },

    handleVisibilityChange() {
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
