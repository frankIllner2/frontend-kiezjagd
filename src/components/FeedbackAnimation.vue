  <template>
    <div v-if="showFeedback" class="feedback-overlay">
      <div class="feedback-content">
        <p>{{ feedbackMessage }}</p>
        <img v-if="feedbackImage" :src="feedbackImage" alt="Antwort Feedback" />
      </div>
    </div>
    <!-- Sterne-Animation -->
    <div v-show="starAnimation && gameType !== 'Maxi'" class="star-container">
      <div v-for="star in flyingStars" :key="star.id" class="star" :class="{ flying: star.flying }">
        ⭐
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
    methods: {
      start() {
        this.starAnimation = true;
        this.animateStars();
      },
      animateStars() {
    console.log('🚀 Starte Stern-Animation...');
    
    this.flyingStars = []; // ⭐ Setze Array immer auf leer, um eine neue Animation zu starten
    this.starAnimation = true; // 🔥 Animation aktivieren, damit die Sterne sichtbar werden
    
    let addedStars = 0;

    const interval = setInterval(() => {
      console.log("🌟 Neuer Stern wird hinzugefügt!", addedStars);

      if (addedStars < this.earnedStars) {this.flyingStars.push({ id: addedStars, flying: true, left: '85vw'  });
        addedStars++;
      } else {
        clearInterval(interval);

        setTimeout(() => {
          console.log("🎯 Animation abgeschlossen. Wechsel zur nächsten Frage.");
          this.starAnimation = false;
          this.$emit("done");

          // Leere `this.flyingStars` erst nach der Animation
          setTimeout(() => {
            this.flyingStars = [];
          }, 500);
        }, 2000); // Wartezeit, bis die Sterne komplett verschwinden
      }
    }, 1000);
  },
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
    background: rgba(250, 194, 39, 0.9);
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
    max-width: 90%;
  }

  .feedback-content p {
    color: #355b4c;
    font-size: clamp(1.4rem, 4vw, 3em);
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
    width: 80vw; /* Feste Breite, damit der Text umbricht */
    max-width: 600px; /* Begrenzung für größere Bildschirme */
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
    line-height: 1.2; /* Guter Zeilenabstand für bessere Lesbarkeit */
    margin-top: 10px;
  }

  .feedback-content img {
    margin-top: 20px;
    max-height: 80vh;
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
  }
  </style>
