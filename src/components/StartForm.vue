<template>
  <form @submit.prevent="submitForm" @keydown.enter.prevent="submitForm" class="start-form">
    <div class="form-group">
      <label for="teamName">Teamname</label>
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
      <label for="email">E-Mail</label>
      <input
        v-model="localEmail"
        id="email"
        placeholder="E-Mail eingeben"
        type="email"
        required
      />
    </div>

    <div class="form-group">
      <label for="playerCount">Spieleranzahl</label>
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
      <label>Spielernamen</label>
      <div v-for="(player, index) in localPlayerNames" :key="index" class="player-input">
        <input
          v-model="localPlayerNames[index]"
          :placeholder="`Spieler ${index + 1}`"
          required
        />
      </div>
    </div>

    <button type="submit" class="btn-primary" :disabled="localTeamExists">Spiel starten</button>
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

    submitForm() {
  if (!this.localTeamName.trim() || !this.localEmail.trim()) {
    console.warn('⚠️ Teamname und E-Mail dürfen nicht leer sein.');
    return;
  }

  if (this.localTeamExists) {
    console.warn('⚠️ Teamname ist bereits vergeben. Bitte wähle einen anderen.');
    return;
  }

  console.log("📢 `localPlayerNames` vor Verarbeitung:", this.localPlayerNames);

  // Vue Proxy in normales Array umwandeln
  const playerNamesArray = [...this.localPlayerNames];

  if (playerNamesArray.length > 0) {
    localStorage.setItem('playerNames', JSON.stringify(playerNamesArray));
    console.log("✅ Spielernamen gespeichert:", localStorage.getItem('playerNames')); // Direkt aus localStorage lesen
  }

  this.$emit('startGame', {
    teamName: this.localTeamName,
    email: this.localEmail,
    playerCount: this.localPlayerCount,
    playerNames: playerNamesArray,
  });
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

<style scoped>
.start-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.player-input {
  margin-top: 5px;
}

button.btn-primary {
  background-color: #4caf50;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button.btn-primary:hover {
  background-color: #388e3c;
}

.error {
  color: red;
  font-size: 0.9rem;
}
</style>
