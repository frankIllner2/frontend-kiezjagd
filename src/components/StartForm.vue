<template>
  <form @submit.prevent="submitForm" @keydown.enter.prevent="submitForm" class="start-form">
    
    <div class="form-group">
      <label for="teamName">Dein Team heißt</label>
      <input
        v-model="localTeamName"
        id="teamName"
        placeholder="Teamname eingeben"
        @blur="checkTeamName"
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
        required
      />
    </div>

    <div class="form-group">
      <label for="playerCount">Wie viele Spieler seid ihr?</label>
      <input
        v-model.number="localPlayerCount"
        id="playerCount"
        type="number"
        min="1"
        @input="adjustPlayerInputs"
        required
      />
    </div>

    <div class="form-group">
      <label>Wie heisst du?</label>
      <div v-for="(player, index) in localPlayerNames" :key="index" class="player-input">
        <input
          v-model="localPlayerNames[index]"
          :placeholder="`Spieler ${index + 1}`"
          required
        />
      </div>
    </div>

    <button type="submit" class="btn btn--secondary" :disabled="localTeamExists">Starte dein Spiel</button>
  </form>
</template>

<script>
import { apiService } from '@/services/apiService';

export default {
  props: {
    gameId: {
      type: String,
      required: true,
    },
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
    async checkTeamName() {
      if (!this.localTeamName.trim()) {
        this.localTeamExists = false;
        return;
      }

      try {
        const response = await apiService.checkTeamName(this.localTeamName, this.gameId);
        this.localTeamExists = response.exists || false;

        if (this.localTeamExists) {
          console.warn('⚠️ Teamname existiert bereits.');
        } else {
          console.log('✅ Teamname ist verfügbar.');
        }
      } catch (error) {
        console.error('❌ Fehler beim Überprüfen des Teamnamens:', error);
        this.localTeamExists = false;
      }
    },

    async submitForm() {
      if (!this.localTeamName.trim() || !this.localEmail.trim()) {
        console.warn('⚠️ Teamname und E-Mail dürfen nicht leer sein.');
        return;
      }

      if (this.localTeamExists) {
        console.warn('⚠️ Teamname ist bereits vergeben. Bitte wähle einen anderen.');
        return;
      }

      const playerNamesArray = [...this.localPlayerNames];

      try {
        // 🧠 NEU: Team speichern im Backend
        await apiService.saveTeam({
          name: this.localTeamName,
          email: this.localEmail,
          players: playerNamesArray,
          gameId: this.gameId,
        });

        console.log('✅ Team wurde erfolgreich gespeichert');

        // Lokale Speicherung & Spielstart
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
