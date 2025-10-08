<template>
  <form @submit.prevent="submitForm" @keydown.enter.prevent="submitForm" class="start-form">
    
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
      />
      <p v-if="localTeamExists" class="error">
        Dieser Teamname ist bereits vergeben. Bitte wähle einen anderen.
      </p>
    </div>

    <div class="form-group">
      <label for="email">Deine E-Maildresse ist</label>
      <input
        v-model="localEmail"
        id="email"
        placeholder="E-Mail eingeben"
        type="email"
        maxlength="40" 
        required
      />
      <p v-if="emailError" class="error">{{ emailError }}</p>

    </div>
    <div class="form-group">
      <label for="playerCount">Wie viele Spieler seid ihr?</label>
      <input
        v-model.number="localPlayerCount"
        id="playerCount"
        type="number"
        :min="1"
        :max="8"
        @input="onPlayerCountChange"
        required
      />
    </div>

    <div class="form-group">
      <label>Wie heisst du?</label>
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


    <button type="submit" class="btn btn--secondary" :disabled="localTeamExists || !!emailError">Starte dein Spiel</button>
  </form>
</template>

<script>
import { apiService } from '@/services/apiService';

export default {
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
      localPlayerCount: this.playerCount || 1,
      localPlayerNames: [...(this.playerNames || [])],
      localTeamExists: this.teamExists || false,
      emailError: '',
      checkTimer: null,
    };
  },
  watch: {
    localPlayerCount() {
      this.adjustPlayerInputs();
    },
    teamExists(newValue) {
      this.localTeamExists = newValue;
    },
  },
  methods: {
    
    normalizeName(s) {
      return (s || '')
        .normalize('NFKC')
        .replace(/\s+/g, ' ')
        .trim();
    },
    onTeamInput() {
      clearTimeout(this.checkTimer);
      this.checkTimer = setTimeout(() => this.checkTeamName(false), 300);
    },
    async checkTeamName() {
      const name = this.normalizeName(this.localTeamName);
      if (!name) { this.localTeamExists = false; return; }
      try {
        const res = await apiService.checkTeamName(name, this.gameId);
        this.localTeamExists = !!(res && res.exists);
      } catch (e) {
        console.error('Teamcheck Fehler:', e);
        this.localTeamExists = false; // im Zweifel nicht blockieren
      }
    },

    async submitForm() {
      this.emailError = '';

      // E-Mail prüfen
      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(this.localEmail)) {
        this.emailError = 'Bitte gib eine gültige E-Mail-Adresse ein.';
        return;
      }

      // Teamname prüfen
      try {
        const check = await apiService.checkTeamName(this.localTeamName, this.gameId);
        this.localTeamExists = check.exists || false;
      } catch (err) {
        console.error("❌ Fehler bei Teamnamenprüfung:", err);
        this.localTeamExists = false; // optional: im Zweifel weitermachen
      }

      if (this.localTeamExists) {
        console.warn('⚠️ Teamname ist bereits vergeben.');
        return;
      }

      const playerNamesArray = [...this.localPlayerNames];

      try {
        await apiService.saveTeam({
          name: this.localTeamName,
          email: this.localEmail,
          players: playerNamesArray,
          gameId: this.gameId,
        });

        localStorage.setItem('playerNames', JSON.stringify(playerNamesArray));

        this.$emit('startGame', {
          teamName: this.localTeamName,
          email: this.localEmail,
          playerCount: this.localPlayerCount,
          playerNames: playerNamesArray,
        });
      } catch (error) {
        console.error('❌ Fehler beim Speichern des Teams:', error);
        alert('Beim Speichern des Teams ist ein Fehler aufgetreten.');
      }
    },

    adjustPlayerInputs() {
      // Begrenzung auf maximal 8 Spieler
      if (this.localPlayerCount > 8) {
        this.localPlayerCount = 8;
      }

      const currentCount = this.localPlayerNames.length;

      if (this.localPlayerCount > currentCount) {
        for (let i = currentCount; i < this.localPlayerCount; i++) {
          this.localPlayerNames.push('');
        }
      } else if (this.localPlayerCount < currentCount) {
        this.localPlayerNames.splice(this.localPlayerCount);
      }
    },
  },
  mounted() {
    this.adjustPlayerInputs();
  },
};

</script>
