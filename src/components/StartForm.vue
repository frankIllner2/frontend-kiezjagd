<template>
  <form @submit.prevent="submitForm" class="start-form" novalidate>
    <div class="form-group">
      <label for="teamName">Dein Team heißt</label>
      <input
        v-model="localTeamName"
        id="teamName"
        placeholder="Teamname eingeben"
        @input="onTeamInput"
        @blur="checkTeamName"
        maxlength="30"
        required
        :aria-invalid="localTeamExists ? 'true' : 'false'"
      />
      <p v-if="localTeamExists" class="error" role="alert">
        Dieser Teamname ist bereits vergeben. Bitte wähle einen anderen.
      </p>
    </div>

    <div class="form-group">
      <label for="email">Deine E-Mailadresse ist</label>
      <input
        v-model="localEmail"
        id="email"
        placeholder="E-Mail eingeben"
        type="email"
        maxlength="40"
        required
        :aria-invalid="emailError ? 'true' : 'false'"
        @blur="validateEmail"
      />
      <p v-if="emailError" class="error" role="alert">{{ emailError }}</p>
    </div>

    <div class="form-group">
      <label for="playerCount">Wie viele Spieler seid ihr?</label>
        <input
          v-model="localPlayerCount"
          id="playerCount"
          type="number"
          inputmode="numeric"
          step="1"
          :min="1"
          :max="8"
          @input="onPlayerCountChange"
          required
        />
    </div>

    <div class="form-group">
      <label>Wie heißt du?</label>
      <div
        v-for="(player, index) in localPlayerNames"
        :key="index"
        class="player-input"
      >
        <input
          v-model="localPlayerNames[index]"
          maxlength="25"
          :placeholder="`Spieler ${index + 1}`"
          required
        />
      </div>
    </div>

    <button
      type="submit"
      class="btn btn--secondary"
      :disabled="isSubmitting || localTeamExists || !!emailError || !canSubmit"
      :aria-busy="isSubmitting ? 'true' : 'false'"
    >
      {{ isSubmitting ? 'Speichere…' : 'Starte dein Spiel' }}
    </button>
  </form>
</template>

<script>
import { apiService } from '@/services/apiService';

export default {
  name: 'StartForm',
  props: {
    gameId: { type: String, required: true },
    teamName: String,
    email: String,
    playerCount: Number,
    playerNames: Array,
    teamExists: Boolean,
  },
  emits: ['startGame'],
  data() {
    return {
      localTeamName: this.teamName || '',
      localEmail: this.email || '',
      localPlayerCount: this.playerCount && this.playerCount >= 1 ? Math.min(this.playerCount, 8) : 1,
      localPlayerNames: Array.isArray(this.playerNames) && this.playerNames.length
        ? [...this.playerNames].slice(0, 8)
        : [''],
      localTeamExists: !!this.teamExists,
      emailError: '',
      checkTimer: null,
      lastCheckQuery: '',    // Race-Guard
      isSubmitting: false,
    };
  },
  computed: {
    canSubmit() {
      const hasTeam = this.normalizeName(this.localTeamName).length > 0 && !this.localTeamExists;
      const hasEmail = !this.emailError && this.localEmail.trim().length > 3;
      const playersOk = this.localPlayerCount >= 1 && this.localPlayerCount <= 8 &&
        this.localPlayerNames.length === this.localPlayerCount &&
        this.localPlayerNames.every(n => this.normalizeName(n).length > 0);
      return hasTeam && hasEmail && playersOk;
    },
  },
  watch: {
    localPlayerCount() {
      this.adjustPlayerInputs();
    },
    teamExists(newValue) {
      this.localTeamExists = !!newValue;
    },
  },
  methods: {
    // --- Utils ---
    normalizeName(s) {
      return (s || '')
        .normalize('NFKC')
        .replace(/\s+/g, ' ')
        .trim();
    },
    validateEmail() {
      this.emailError = '';
      const email = this.localEmail.trim().toLowerCase();
      if (!email) {
        this.emailError = 'Bitte gib deine E-Mail-Adresse ein.';
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        this.emailError = 'Bitte gib eine gültige E-Mail-Adresse ein.';
      }
    },

    // --- Teamname-Check mit Debounce & Race-Guard ---
    onTeamInput() {
      clearTimeout(this.checkTimer);
      this.checkTimer = setTimeout(() => this.checkTeamName(), 300);
    },
    async checkTeamName() {
      const name = this.normalizeName(this.localTeamName);
      if (!name) {
        this.localTeamExists = false;
        return;
      }
      // Race-Guard: merke aktuelle Anfrage
      this.lastCheckQuery = name;
      try {
        const res = await apiService.checkTeamName(name, this.gameId);
        // veraltete Antwort ignorieren
        if (this.lastCheckQuery !== name) return;
        this.localTeamExists = !!(res && res.exists);
      } catch (e) {
        console.error('Teamcheck Fehler:', e);
        // Im Zweifel nicht blockieren (aber Nutzer nicht völlig im Dunkeln lassen)
        this.localTeamExists = false;
      }
    },

    // --- Spieler-Eingabefelder synchronisieren ---
    onPlayerCountChange() {
      // Immer als ganze Zahl interpretieren
      const n = parseInt(this.localPlayerCount, 10);

      // Wenn gerade leer/NaN → noch nichts hart setzen, aber UI nicht „springen“ lassen
      if (!Number.isFinite(n)) {
        // nichts tun – der Nutzer tippt evtl. noch
        return;
      }

      // Sauber clampen (1..8) und erst dann anwenden
      const clamped = Math.max(1, Math.min(n, 8));
      if (clamped !== this.localPlayerCount) {
        this.localPlayerCount = clamped;
      }
      this.adjustPlayerInputs();
    },

    adjustPlayerInputs() {
      const count = Math.min(Math.max(this.localPlayerCount, 1), 8);
      const current = this.localPlayerNames.length;

      if (current < count) {
        for (let i = current; i < count; i++) this.localPlayerNames.push('');
      } else if (current > count) {
        this.localPlayerNames.splice(count);
      }

      // Leereinträge säubern (aber Platzhalter behalten)
      this.localPlayerNames = this.localPlayerNames.map(n => this.normalizeName(n));
      if (!this.localPlayerNames.length) this.localPlayerNames = [''];
    },

    // --- Submit ---
    async submitForm() {
      this.isSubmitting = true;
      try {
        // Email prüfen
        this.validateEmail();
        if (this.emailError) return;

        // Teamname final prüfen (aktuelle Version)
        await this.checkTeamName();
        if (this.localTeamExists) return;

        // Spieler aufbereiten
        const players = this.localPlayerNames
          .map(n => this.normalizeName(n))
          .filter(n => n.length > 0);

        // Sicherstellen, dass Länge passt
        if (players.length !== this.localPlayerCount) {
          // fallback: fehlende mit Platzhalter auffüllen
          while (players.length < this.localPlayerCount) players.push(`Spieler ${players.length + 1}`);
          if (players.length > 8) players.splice(8);
        }

        // Team speichern
        await apiService.saveTeam({
          name: this.normalizeName(this.localTeamName),
          email: this.localEmail.trim().toLowerCase(),
          players,
          gameId: this.gameId,
        });

        // Lokale Speicherung der Namen (optional)
        try {
          localStorage.setItem('playerNames', JSON.stringify(players));
        } catch (e) {
          // non-blocking
        }

        // Elternkomponente informieren
        this.$emit('startGame', {
          teamName: this.normalizeName(this.localTeamName),
          email: this.localEmail.trim().toLowerCase(),
          playerCount: this.localPlayerCount,
          playerNames: players,
        });
      } catch (error) {
        console.error('❌ Fehler beim Speichern des Teams:', error);
        alert('Beim Speichern des Teams ist ein Fehler aufgetreten.');
      } finally {
        this.isSubmitting = false;
      }
    },
  },
  mounted() {
    // Felder initial an playerCount angleichen
    this.adjustPlayerInputs();
  },
};
</script>

<style scoped>
.error {
  color: #b00020;
  margin-top: .25rem;
}
.player-input + .player-input {
  margin-top: .25rem;
}
</style>
