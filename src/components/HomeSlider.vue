<template>
  <section id="game-preview-section" class="container game-preview-section">
    <h2>Wähle dein Spiel!</h2>
    <div class="glide" ref="slider">
      <!-- Nur anzeigen, wenn `canPrev` wahr ist -->
      <button
        v-if="canPrev"
        class="glide__arrow glide__arrow--left"
        @click="prevSlide"
      >
        ◀
      </button>

      <div class="glide__track">
        <ul class="glide__slides" ref="slides">
          <li
            v-for="(game, index) in games"
            :key="index"
            class="glide__slide card"
          >
            <div class="short-description">
              <img :src="getGameImagePath(game.gameImage)" :alt="game.name" class="image-game" />
              
              <div class="short">
                <div class="game-infos" @click="toggleLayer(index)">
                  <b>{{ game.name }}</b>
                  <b>{{ game.ageGroup }}</b>
                  <img src="@/assets/img/icons/open-plus.png" alt="open" class="open-layer"/>
                </div>
                <div class="short-right">
                  <div class="button">
                    <button class="btn btn--fourth" @click="$emit('open-modal', game.encryptedId)">
                      Spiel kaufen
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- Long-description -->
            <div class="long-description" :class="{ 'long-description-active': activeIndex === index }">
              <div class="long-description-content">
                <div class="top-content">
                  <div class="top-info">
                    <b>{{ game.name }}</b>
                  </div>
                  <div class="close-btn" @click="closeLayer">×</div>
                </div>
                <div class="game-information">
                  <div class="game-infos-left">
                    <span>Schwierigkeit</span>
                    <span>{{ game.ageGroup }}</span><br />
                    <span>Start</span>
                    <span>{{ game.startloction }}</span>
                  </div>
                  <div class="game-infos-right">
                    <span>Dauer</span>
                    <span>{{ game.playtime }}</span><br />
                    <span>Ende</span>
                    <span>{{ game.endloction }}</span>
                  </div>
                </div>
                <div class="game-description">
                  <span>Was wir Wissen:</span>
                  <span>{{ game.description }}</span>
                </div>
                <div class="price">
                <span>Preis</span>
                <span>{{ game.price }}</span>
                </div>
                <div class="button">
                  <button class="btn btn--primary" @click="$emit('open-modal', game.encryptedId)">
                    Spiel kaufen
                  </button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Nur anzeigen, wenn `canNext` wahr ist -->
      <button
        v-if="canNext"
        class="glide__arrow glide__arrow--right"
        @click="nextSlide"
      >
        ▶
      </button>
    </div>

    <!-- Position-Anzeige -->
    <div class="slide-position">
      {{ visibleCount }} / {{ totalSlides }}
    </div>
  </section>
</template>

<script>
export default {
  name: "GamePreviewSlider",
  props: {
    games: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      currentIndex: 0, // Index des ersten sichtbaren Elements
      perView: 1,
      gap: 20, // Abstand zwischen den Slides in Pixel
      activeIndex: null,
    };
  },
  computed: {
    totalSlides() {
      return this.games.length; // Gesamtanzahl der Slides
    },
    visibleCount() {
      // Mobile: Einzelne Karte zählt
      // Desktop: Erster Index + perView
      return Math.min(this.currentIndex + this.perView, this.totalSlides);
    },
    canNext() {
      return this.currentIndex < this.games.length - this.perView;
    },
    canPrev() {
      return this.currentIndex > 0;
    },
  },
  mounted() {
    this.updatePerView();
    window.addEventListener("resize", this.updatePerView);
    setTimeout(() => {
      this.updateSlider(false);
    }, 200);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updatePerView);
  },
  methods: {
    updatePerView() {
      if (window.innerWidth >= 1024) {
        this.perView = 3;
      } else if (window.innerWidth >= 768) {
        this.perView = 2;
      } else {
        this.perView = 1;
      }
      console.log("perView updated:", this.perView);
      setTimeout(() => {
        this.updateSlider(false);
      }, 100);
    },
    nextSlide() {
      if (this.canNext) {
        this.currentIndex++;
        this.updateSlider();
      }
    },
    prevSlide() {
      if (this.canPrev) {
        this.currentIndex--;
        this.updateSlider();
      }
    },
    updateSlider(animate = true) {
      if (this.$refs.slides && this.$refs.slider) {
        const sliderWidth = this.$refs.slider.offsetWidth;
        const totalGaps = (this.perView - 1) * this.gap;
        const slideWidth = Math.floor((sliderWidth - totalGaps) / this.perView);
        
        const slideItems = this.$refs.slides.children;
        for (let slide of slideItems) {
          slide.style.width = `${slideWidth}px`;
        }
        
        const offset = this.currentIndex * (slideWidth + this.gap);
        console.log("sliderWidth:", sliderWidth, "slideWidth:", slideWidth, "offset:", offset);
        
        this.$refs.slides.style.transition = animate ? "transform 0.4s ease-in-out" : "none";
        this.$refs.slides.style.transform = `translateX(-${offset}px)`;
      }
    },
    getGameImagePath(imagePath) {
        return new URL(imagePath, import.meta.url).href;
    },
    toggleLayer(index) {
      this.activeIndex = this.activeIndex === index ? null : index;
    },
     closeLayer() {
      this.activeIndex = null;
    },
  },
};
</script>

<style scoped>
.glide {
  position: relative;
  max-width: 100%;
  overflow: hidden;
}
.glide__track {
  overflow: hidden;
}
.glide__slides {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 20px;
  transition: transform 0.4s ease-in-out;
  width: auto;
}
.glide__slide {
  flex: 0 0 auto;
  text-align: center;
}
.glide__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  padding: 10px;
  z-index: 10;
}
.glide__arrow--left {
  left: 10px;
}
.glide__arrow--right {
  right: 10px;
}
.slide-position {
  text-align: right;
  font-size: clamp(1.4rem, 3vw, 2em);
  margin-top: 10px;
  color: #355b4c;
}
.short-description {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #FAC227;
    border-radius: 20px;
    width: 100%;
    padding-bottom: 15px;

    .image-game {
        max-width: 422px;
        width: 100%;
        margin-bottom: 10px;
        border-radius: 20px 20px 0 0;
    }
}
.short {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0px 15px;
}

.game-infos {
    display: flex;
    align-items: center; /* Zentriert die Elemente vertikal */
    justify-content: flex-end; /*Richt das Icon rechts aus*/
    gap: 10px; /* Abstand zwischen den Elementen */
    width: 100%;
    cursor: pointer;
    b {
        display: flex;
        flex-direction: column;
        align-items: start;
        line-height: 1.1;
    }
}

.short-right {
  display: flex;
  align-items: center;
}

.short-right .open-layer {
  width: 50px;
  height: auto;
  margin-right: 10px; /* Abstand zwischen dem Icon und dem Button */
}

.short-right .button button {
  padding: 10px 5px;
  border-radius: 0 0 20px 0;
}
/* long-description */
.long-description {
    position: absolute;
    bottom: -100%; /* Versteckt den Container außerhalb des sichtbaren Bereichs */
    left: 0;
    width: 100%; /* Nimmt die gesamte Breite ein */
    padding: 20px;
    background-color: #355b4c; /* Hintergrundfarbe */
    color: #FAC227;
    z-index: 5; /* Unter dem Hover-Layer */
    transition: bottom 0.5s ease-in-out; /* Animationseffekt */
    height: 100%;
    border-radius: 20px;
    .game-infos-left, .game-infos-right {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
}

.long-description-active {
    bottom: 0px; /* Zeigt den Container an */
}
.long-description .top-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
}
.long-description .close-btn {
  font-size: 30px;
  cursor: pointer;
}
.long-description .game-information {
    display: flex;
    justify-content: stretch;
    margin-bottom: 2em;
}

.long-description .button {
  display: flex;
  justify-content: flex-end; /* Den Button rechts ausrichten */
  
}
</style>
