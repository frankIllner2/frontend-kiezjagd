<template>
    <div v-show="showBonus" class="time-bonus-text">
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
      };
    },
    methods: {
      startTimeBonusAnimation(bonus) {
        if (!bonus || this.gameType !== "Maxi") return;
  
        this.bonusAmount = bonus;
        this.showBonus = true;
  
        // Trigger Zeitgutschrift im Eltern-Element
        this.$emit("applyBonus", bonus);
  
        // Animation nach 3s ausblenden
        setTimeout(() => {
          this.showBonus = false;
          this.$emit("done");
        }, 6000);
      },
  
    },
  };
  </script>
  
  <style scoped>
  .time-bonus-text {
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 2.5rem;
    font-weight: bold;
    color: #355b4c;
    pointer-events: none;
    opacity: 1;
    z-index: 100;
    animation: fly-up 3.2s ease-out forwards;
  }
  
  @keyframes fly-up {
    0% {
      transform: translateY(100vh) scale(1);
      opacity: 1;
    }
    50% {
      transform: translate(0, -40vh) scale(1.5);
      opacity: 1;
    }
    100% {
      transform: translate(0, -80vh) scale(0.8);
      opacity: 0;
    }
  }
  </style>
  