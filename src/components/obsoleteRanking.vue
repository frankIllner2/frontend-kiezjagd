<template>
  <div v-if="ranking && ranking.length > 0" class="ranking-container">
    <h4>🏆 Ranking (Top 5)</h4>
    <ul>
      <li v-for="(team, index) in ranking" :key="index">
        {{ index + 1 }}. {{ team.teamName }} - {{ team.duration }}
      </li>
    </ul>
  </div>
  <div v-else>
    <p>Kein Ranking verfügbar.</p>
  </div>
</template>

<script>
export default {
  props: ['ranking']
};
</script>

<style scoped>
.ranking-container {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  margin-top: 20px;
}

h4 {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #333;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  font-size: 1rem;
  margin: 5px 0;
}

p {
  font-size: 1rem;
  color: #777;
  text-align: center;
}
</style>
