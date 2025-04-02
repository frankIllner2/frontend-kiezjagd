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
          <span v-if="getGameType(item.topResults) === 'Maxi' || result.gameType === 'Medi'">{{ idx + 1 }}.</span>

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

      if (gameType === 'Mini') {
        // Nach startTime sortieren (neueste oben)
        return results.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      } else if (gameType === 'Medi') {
        // Nach Anzahl der Sterne sortieren (häufigste zuerst)
        return results.sort((a, b) => b.stars - a.stars);
      } else {
        // Maxi: Dauer in Minuten berechnen und sortieren (kürzeste zuerst)
        return results.sort((a, b) => {
          const timeToMinutes = (duration) => {
            const hMatch = duration.match(/(\d+)h/);
            const mMatch = duration.match(/(\d+)m/);
            const hours = hMatch ? parseInt(hMatch[1]) : 0;
            const minutes = mMatch ? parseInt(mMatch[1]) : 0;
            return hours * 60 + minutes;
          };

          const timeA = timeToMinutes(a.duration);
          const timeB = timeToMinutes(b.duration);
          return timeA - timeB;
        });
      }
    }

  }

};
</script>

 
<style>
/* Falls spezifische Styles für den Ranking-Slider notwendig sind */

</style>
