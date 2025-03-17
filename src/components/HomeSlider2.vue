<template>
  <BaseSlider 
    v-if="rankings.length > 0"
    title="Mitgemacht" 
    :items="rankings" 
    sliderId="ranking-slider" 
    containerClass="container ranking-section"
  >
    <template v-slot:default="{ item }">
      <b>{{ item.gameName }}</b>
      <span class="game-type">{{ getGameType(item.topResults) }}</span>
      <ul>
        <li v-for="(result, idx) in item.topResults" :key="idx">
          <span>{{ idx + 1 }}.</span> <strong>{{ result.teamName }}</strong>
         
          <span v-if="result.gameType === 'Mini' || result.gameType === 'Medi'">
            {{ result.stars }} Sterne
          </span>
          <span v-else>
            {{ parseInt(result.duration.split("h")[1]) }} Minuten
          </span>
          
        </li>
      </ul>
    </template>
  </BaseSlider>
</template>

<script>
import BaseSlider from "@/components/BaseSlider.vue";

export default {
  components: { BaseSlider },
  props: {
    rankings: Array,
  },
  methods: {
    getGameType(results) {
      if (!results.length) return "";
      return results[0].gameType; // Nimmt einfach den ersten gameType des Spiels
    }
  }
};
</script>


<style scoped>
/* Falls spezifische Styles für den Ranking-Slider notwendig sind */
.card {
  align-items: flex-start;
  background-image: url("@/assets/img/icons/girl2.svg");
  background-size: 70px;
  background-position: top right;
  background-repeat: no-repeat;
 
}
.card h4 {
  margin-top: 5px;
  font-size: 40px;
}
.card b {
  font-size: 24px;
  margin-top: -25px;
}
.card ul {
  padding-left: 15px;
}
.card ul li {
  display: grid;
  grid-template-columns: 15px auto 100px;
  list-style-type: none;
}
.card ul li strong {
  padding: 0 10px;
  max-width: 160px;
  width: 100%;
}
</style>
