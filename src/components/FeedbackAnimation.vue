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
