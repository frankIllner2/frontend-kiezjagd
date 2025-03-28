<template>
  <BaseSlider 
    v-if="rankings.length > 0"
    title="Mitgemacht" 
    :items="rankings" 
    sliderId="ranking-slider" 
    containerClass="container ranking-section"
  >
    <template v-slot:default="{ item }">
      <div class="game-header">
      <b>{{ item.gameName }}</b>
      <img
        v-if="getGameType(item.topResults) === 'Mini'"
        src="@/assets/img/icons/hand.png"
        alt="Mini Icon"
      />
      <img
        v-else-if="getGameType(item.topResults) === 'Medi'"
        src="@/assets/img/icons/sterne.png"
        alt="Medi Icon"
      />
      <img
        v-else
        src="@/assets/img/icons/krone.png"
        alt="Default Icon"
      />
    </div>
  
      <span class="game-type">{{ getGameType(item.topResults) }}</span>
      <ul>
        <li
          v-for="(result, idx) in getSortedResults(item)"
          :key="idx"
        >
          <!-- Nur bei Maxi anzeigen wir das Ranking -->
          <span v-if="getGameType(item.topResults) === 'Maxi'">{{ idx + 1 }}.</span>

          <strong>{{ result.teamName }}</strong>

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
      return results[0].gameType;
    },

    getSortedResults(item) {
      const results = [...item.topResults];
      const gameType = this.getGameType(results);

      if (gameType === 'Mini' || gameType === 'Medi') {
        // Nach startTime sortieren (neueste oben)
        return results.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      } else {
        // Nach Zeit sortieren (kürzeste Dauer oben)
        return results.sort((a, b) => {
          const timeA = parseInt(a.duration.split("h")[1]);
          const timeB = parseInt(b.duration.split("h")[1]);
          return timeA - timeB;
        });
      }
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
  .glide__slide {
    img {
      width: 100%;
      height: auto;
      max-width: 70px;
    }
  }

}
</style>
