<template>
  <div v-if="showFeedback" class="feedback-overlay">
    <div class="feedback-content">
      <img v-if="feedbackImage" :src="feedbackImage" alt="Antwort Feedback" />
    </div>

    <!-- Sterne-Animation innerhalb des Feedbacks -->
    <div v-if="starAnimation && gameType !== 'Maxi'" class="star-container">
      <div
        v-for="star in flyingStars"
        :key="star.id"
        class="star"
        :class="{ flying: star.flying }"
      >
      <font-awesome-icon icon="star" />
      </div>
    </div>
  </div>
</template>


  <script>
  export default {
    props: {
      showFeedback: Boolean,
      feedbackMessage: String,
      feedbackImage: String,
      earnedStars: Number,
      gameType: String,
    },
    data() {
      return {
        starAnimation: false,
        flyingStars: [],
      };
    },
    beforeUnmount() {
      this.flyingStars = [];
      this.starAnimation = false;
    },
    methods: {
      start(stars) {
        console.log("🎬 Animation gestartet mit", stars, "Sternen");

        if (!stars || stars <= 0) {
          console.log("⛔ Keine Animation – earnedStars war:", stars);
          return;
        }

        this.starAnimation = true;
        this.flyingStars = [];
        this.animateStars(stars);
      },
      animateStars(stars) {
        
        if (!stars || stars <= 0) {
          console.log("⛔ Keine Animation – earnedStars war:", stars);
          return;
        }
        console.log("🚀 Starte Stern-Animation...");
        
        this.flyingStars = []; // ⭐ Setze Array immer auf leer
        this.starAnimation = true; // 🔥 Animation aktivieren
        
        let addedStars = 0;
        let countingStarted = false; // ⏳ Wird benutzt, um das Hochzählen zu starten

        const interval = setInterval(() => {
          if (addedStars < stars) {
            console.log("🌟 Neuer Stern wird hinzugefügt!", addedStars);

            this.flyingStars.push({
              id: addedStars,
              flying: true,
              left: "85vw", // Immer auf der rechten Seite
            });

            addedStars++;

            // 🟢 Starte das Hochzählen, wenn der erste Stern beginnt
            if (!countingStarted) {
              countingStarted = true;
              this.$emit("startCounting"); // 🔥 Signal an `Game.vue`, um das Hochzählen zu starten
            }
          } else {
            clearInterval(interval);
          }
        }, 1000);
      }
    },
  };
  </script>

  <style scoped>
  /* Feedback Overlay */
  .feedback-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #E9E2D0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    text-align: center;
  }

  .feedback-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 98%;
  }

  .feedback-content p {
    color: #355b4c;
    font-size: clamp(1.2rem, 2vw, 2em);
    text-align: center;
    margin-bottom: 20px;
    width: 90vw;
    max-width: 600px; /* Begrenzung für größere Bildschirme */
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
    line-height: 1.2; /* Guter Zeilenabstand für bessere Lesbarkeit */
    margin-top: 4.5em;
  }

  .feedback-content img {
    margin-top: 20px;
    height: auto;
    width: 100%;
  }

  /* Sterne-Container */
  .star-container {
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; /* Verhindert, dass der Container Klicks blockiert */
    z-index: 2001;
  }

  /* Stern-Animation */
  @keyframes fly-to-status {
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

  .star {
    font-size: 50px;
    position: absolute;
    animation: fly-to-status 4s ease-in-out forwards;
    right: 5vw; 
    color: #FAC227;
  }
  </style>
