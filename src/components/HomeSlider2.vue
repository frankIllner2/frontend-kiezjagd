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
            {{ parseInt(result.duration.split("h")[1]) }} Min.
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

 
<style>
/* Falls spezifische Styles für den Ranking-Slider notwendig sind */
.ranking-section {
  
  .card ul li strong {
    padding: 0 10px;
    max-width: 160px;
    width: 100%;
  }
  .glide {
    button.glide__arrow {
      display: none !important;
    }
  }

}
</style>
