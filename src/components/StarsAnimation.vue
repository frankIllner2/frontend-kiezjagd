<template>
    <div v-if="show" class="feedback-overlay">
      <div class="feedback-content">
        <p>{{ message }}</p>
        <img v-if="image" :src="image" alt="Feedback Bild" />
  
        <!-- Sterne-Animation -->
        <div v-if="starAnimation" class="star-container">
          <transition-group name="star-fly">
            <div v-for="star in flyingStars" :key="star.id" class="star">⭐</div>
          </transition-group>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      show: Boolean,        // Zeigt das Feedback
      message: String,      // Feedback-Nachricht
      image: String,        // Feedback-Bild (correct.gif / false.png)
      earnedStars: Number,  // Anzahl der verdienten Sterne
    },
    data() {
      return {
        starAnimation: false,
        flyingStars: []
      };
    },
    watch: {
      show(newVal) {
        if (newVal) {
          setTimeout(() => {
            this.startStarAnimation();
          }, 5000); // Feedback-Bild bleibt 5 Sekunden sichtbar
        }
      }
    },
    methods: {
      startStarAnimation() {
        this.starAnimation = true;
        let addedStars = 0;
  
        const interval = setInterval(() => {
          if (addedStars < this.earnedStars) {
            this.flyingStars.push({ id: addedStars });
            addedStars++;
          } else {
            clearInterval(interval);
            setTimeout(() => {
              this.starAnimation = false;
              this.flyingStars = [];
              this.$emit("done"); // ✅ Signal an `Game.vue`, dass alles fertig ist
            }, 1000);
          }
        }, 500);
      }
    }
  };
  </script>
  
  <style scoped>
  /* Feedback Overlay */
  .feedback-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(250, 194, 39, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    text-align: center;
  }
  
  /* Sterne-Container */
  .star-container {
    position: fixed;
    bottom: 20%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  /* Stern-Animation */
  @keyframes fly-to-status {
    0% { transform: translateY(100vh) scale(1); opacity: 1; }
    50% { transform: translate(30vw, -40vh) scale(1.5); opacity: 1; }
    100% { transform: translate(45vw, -55vh) scale(0.8); opacity: 0; }
  }
  
  .star {
    font-size: 50px;
    position: absolute;
    animation: fly-to-status 2s ease-in-out forwards;
  }
  </style>
  