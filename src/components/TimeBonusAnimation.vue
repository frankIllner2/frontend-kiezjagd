<template>
  <div
    v-show="showBonus"
    :class="['time-bonus-text', { 'animate-bonus': animate }]">
    +{{ bonusAmount }}s
  </div>
</template>

  
<script>
export default {
  props: {
    gameType: String,
  },
  data() {
    return {
      bonusAmount: 0,
      showBonus: false,
      animate: false,
    };
  },
  methods: {
    startTimeBonusAnimation(bonus) {
      if (!bonus || this.gameType !== "Maxi") return;

      this.bonusAmount = bonus;
      this.showBonus = true;
      this.animate = false;

      // ⏱ Bonus anwenden sofort
      this.$emit("applyBonus", bonus);

      // 🎬 Starte Animation erst 1s später
      setTimeout(() => {
        this.animate = true;
      }, 1000);

      // 🚪 Schließe nach 6 Sekunden alles
      setTimeout(() => {
        this.animate = false;
        this.showBonus = false;
        this.$emit("done");
      }, 6000);
    }
  }
};
</script>
