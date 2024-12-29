<template>
  <div>
    <div class="card" v-for="game in games" :key="game._id">
      <h3>{{ game.name }}</h3>
      <p><strong>Stadt:</strong> {{ game.city }}</p>
      <p><strong>Altersgruppe:</strong> {{ game.ageGroup }}</p>
      <button @click="$emit('edit', game)">Bearbeiten</button>
      <button @click="$emit('delete', game._id)">Löschen</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['games'],
  emits: ['edit', 'delete']
};
</script>

<style scoped>
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

h3 {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

p {
  margin: 5px 0;
}

button {
  margin-right: 10px;
  padding: 5px 10px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #4caf50;
  color: white;
}
</style>
