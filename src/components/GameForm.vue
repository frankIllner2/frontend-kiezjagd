<template>
  <form @submit.prevent="saveGame" class="save-game.form">
    <div class="form-group">
      <label for="city">Stadt/PLZ</label>
      <input v-model="localGame.city" id="city" placeholder="Stadt/PLZ" required />
    </div>

    <div class="form-group">
      <label for="name">Spielname</label>
      <input v-model="localGame.name" id="name" placeholder="Spielname" required />
    </div>

    <div class="form-group">
      <label for="ageGroup">Altersgruppe</label>
      <select v-model="localGame.ageGroup" id="ageGroup" required>
        <option value="">Altersgruppe auswählen</option>
        <option>5-7 Jahre</option>
        <option>8-10 Jahre</option>
        <option>11-13 Jahre</option>
      </select>
    </div>

    <button type="submit" class="btn-primary">Speichern</button>
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
.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input,
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

button.btn-primary {
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

button.btn-primary:hover {
  background-color: #388e3c;
}
</style>
