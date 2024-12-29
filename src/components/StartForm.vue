<template>
  <form @submit.prevent="submitForm" @keydown.enter.prevent="submitForm" class="start-form">
    <div class="form-group">
      <label for="teamName">Teamname</label>
      <input
        v-model="localTeamName"
        id="teamName"
        placeholder="Teamname eingeben"
        required
      />
      <button 
        type="button" 
        @click="checkTeamName" 
        class="btn-secondary"
        :disabled="!localTeamName.trim()"
      >
        Teamname prüfen
      </button>
    </div>


    <div v-if="localTeamExists" class="error">Teamname existiert bereits!</div>

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

    <button type="submit" class="btn-primary">Spiel starten</button>
  </form>
</template>


<script>
import { apiService } from '@/services/apiService';

export default {
  props: {
    teamName: String,
    email: String,
    playerCount: Number,
    playerNames: Array,
    teamExists: Boolean,
  },
  emits: ['checkTeamName', 'startGame'],
  data() {
    return {
      localTeamName: this.teamName || '',
      localEmail: this.email || '',
      localPlayerCount: this.playerCount || 1,
      localPlayerNames: [...(this.playerNames || [])],
      localTeamExists: this.teamExists || false, // Lokale Kopie für Änderungen
    };
  },
  watch: {
    localPlayerCount() {
      this.adjustPlayerInputs();
    },
    teamExists(newValue) {
      this.localTeamExists = newValue; // Reaktiver Prop-Wert wird in lokale Kopie übernommen
    }
  },
  methods: {
    async checkTeamName() {
    console.log('✅ Methode `checkTeamName` aufgerufen');
    if (!this.localTeamName.trim()) {
      console.warn('⚠️ Teamname darf nicht leer sein.');
      this.localTeamExists = false;
      return;
    }
    try {
      const response = await apiService.checkTeamName(this.localTeamName);
      console.log('🔄 API Antwort:', response);
      this.localTeamExists = response.exists || false;
    } catch (error) {
      console.error('❌ Fehler beim Überprüfen des Teamnamens:', error);
      this.localTeamExists = false;
    }
  },
  submitForm() {
      console.log('✅ submitForm aufgerufen');
      console.log('Teamname:', this.localTeamName);
      console.log('E-Mail:', this.localEmail);
      console.log('Spieleranzahl:', this.localPlayerCount);
      console.log('Spielernamen:', this.localPlayerNames);

      if (!this.localTeamName.trim() || !this.localEmail.trim()) {
        console.warn('⚠️ Teamname und E-Mail dürfen nicht leer sein.');
        return;
      }

      this.$emit('startGame', {
        teamName: this.localTeamName,
        email: this.localEmail,
        playerCount: this.localPlayerCount,
        playerNames: this.localPlayerNames,
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
    }
  },
  mounted() {
    this.adjustPlayerInputs();
  }
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

button.btn-secondary {
  margin-top: 10px;
  background-color: #2196f3;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button.btn-secondary:hover {
  background-color: #1976d2;
}

.error {
  color: red;
  font-size: 0.9rem;
}
</style>
