<template>
  <form @submit.prevent="saveGame" class="game-form">
    <h2>{{ localGame._id ? 'Spiel bearbeiten' : 'Neues Spiel erstellen' }}</h2>
    
    <!-- Stadt/PLZ -->
    <div class="form-group">
      <label for="city">Stadt/PLZ</label>
      <input v-model="localGame.city" id="city" placeholder="Stadt/PLZ eingeben" required />
    </div>

    <!-- Spielname -->
    <div class="form-group">
      <label for="name">Spielname</label>
      <input v-model="localGame.name" id="name" placeholder="Spielname eingeben" required />
    </div>

    <!-- Spielbeschreibung -->
    <div class="form-group">
      <label for="description">Spielbeschreibung</label>
      <textarea 
        v-model="localGame.description" 
        id="description" 
        placeholder="Kurze Beschreibung des Spiels hinzufügen" 
        rows="4"
        required
      ></textarea>
    </div>

    <!-- Altersgruppe -->
    <div class="form-group">
      <label for="ageGroup">Altersgruppe</label>
      <select v-model="localGame.ageGroup" id="ageGroup" required>
        <option value="">Altersgruppe auswählen</option>
        <option>5-7 Jahre</option>
        <option>8-10 Jahre</option>
        <option>11-13 Jahre</option>
      </select>
    </div>

    <!-- Button-Gruppe -->
    <div class="form-actions">
      <button type="submit" class="btn-primary">Speichern</button>
      <button type="button" class="btn-secondary" @click="$emit('cancel')">Abbrechen</button>
    </div>
  </form>
</template>

<script>
export default {
  props: {
    game: {
      type: Object,
      required: true,
    },
  },
  emits: ['save', 'update:game'],
  data() {
    return {
      localGame: { ...this.game }, // Lokale Kopie von game erstellen
    };
  },
  watch: {
    game: {
      handler(newValue) {
        this.localGame = { ...newValue };
      },
      deep: true,
    },
  },
  methods: {
    saveGame() {
      this.$emit('update:game', this.localGame); // Änderungen an Elternkomponente senden
      this.$emit('save', this.localGame); // Optional für andere Aktionen
    },
  },
};
</script>
<style scoped>
/* 🎯 Allgemeine Formular-Stile */
.game-form {
  background: #ffffff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
  max-width: 600px;
  text-align: left;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #4caf50;
  text-align: center;
}

/* 📝 Formulargruppen */
.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 1rem;
  color: #444;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus,
select:focus {
  border-color: #4caf50;
  outline: none;
}

/* 🛠️ Button-Gruppe */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

/* 💾 Primärer Button */
.btn-primary {
  background-color: #4caf50;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #388e3c;
}

/* ❌ Sekundärer Button */
.btn-secondary {
  background-color: #f44336;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background-color: #d32f2f;
}

/* 📱 Mobile Optimierung */
@media (max-width: 768px) {
  .game-form {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  button {
    width: 100%;
  }
}
</style>
