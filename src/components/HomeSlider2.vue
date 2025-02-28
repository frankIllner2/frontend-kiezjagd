<template>
    <section id="ranking-slider" class="container ranking-section">
      <h2>Mitgemacht</h2>
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
              v-for="(ranking, index) in rankings"
              :key="index"
              class="glide__slide card"
            >

              
              <b>{{ ranking.gameName }}</b>
              <ul>
                <li v-for="(result, idx) in ranking.topResults" :key="idx">
                  <span>{{ idx + 1 }}.</span> <strong>{{ result.teamName }}</strong>
                  <span>{{ result.duration }}</span>
                </li>
              </ul>
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
    name: "HomeSlider2",
    props: {
      rankings: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        currentIndex: 0,
        perView: 1,
        gap: 20,
        startX: 0,  // Startposition beim Touch
        isSwiping: false
      };
    },
    computed: {
      totalSlides() {
        return this.rankings.length;
      },
      visibleCount() {
        return Math.min(this.currentIndex + this.perView, this.totalSlides);
      },
      canNext() {
        return this.currentIndex < this.rankings.length - this.perView;
      },
      canPrev() {
        return this.currentIndex > 0;
      },
    },
    mounted() {
    this.updatePerView();
    window.addEventListener("resize", this.updatePerView);

    const track = this.$refs.slides;
    if (track) {
        track.addEventListener("touchstart", this.onTouchStart);
        track.addEventListener("touchmove", this.onTouchMove);
        track.addEventListener("touchend", this.onTouchEnd);
    }

    setTimeout(() => {
      this.updateSlider(false);
    }, 200);
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.updatePerView);
        const track = this.$refs.slides;
        if (track) {
            track.removeEventListener("touchstart", this.onTouchStart);
            track.removeEventListener("touchmove", this.onTouchMove);
            track.removeEventListener("touchend", this.onTouchEnd);
        }
        },
    methods: {
    onTouchStart(event) {
        this.startX = event.touches[0].clientX; // X-Position des ersten Touches
        this.isSwiping = true;
    },
    onTouchMove(event) {
        if (!this.isSwiping) return;
        const moveX = event.touches[0].clientX;
        const diff = this.startX - moveX;

        if (diff > 50) {
        this.nextSlide(); // Wische nach links → Nächste Slide
        this.isSwiping = false;
        } else if (diff < -50) {
        this.prevSlide(); // Wische nach rechts → Vorherige Slide
        this.isSwiping = false;
        }
    },
    onTouchEnd() {
        this.isSwiping = false;
    },
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
        }, 300);
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
        // Es wird geprüft ob die Elemente vorhanden sind.
        if (this.$refs.slides && this.$refs.slider) {
          this.$nextTick(() => {
            const sliderWidth = this.$refs.slider.offsetWidth;
            const totalGaps = (this.perView - 1) * this.gap;
            const slideWidth = Math.floor((sliderWidth - totalGaps) / this.perView);
  
            const slideItems = this.$refs.slides.children;
            for (let slide of slideItems) {
              slide.style.width = `${slideWidth}px`;
            }
  
            const offset = this.currentIndex * (slideWidth + this.gap);
            console.log(
              "sliderWidth:",
              sliderWidth,
              "slideWidth:",
              slideWidth,
              "offset:",
              offset
            );
  
            this.$refs.slides.style.transition = animate
              ? "transform 0.4s ease-in-out"
              : "none";
            this.$refs.slides.style.transform = `translateX(-${offset}px)`;
          });
        }
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
    min-height: 400px;
  }
  .glide__arrow {
    position: absolute;
    bottom: 0;
    transform: translateY(-15%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    cursor: pointer;
    padding: 15px;
    border-radius: 15px;
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
  /* Ranking */
  .card {
    align-items: flex-start;
    background-image: url("@/assets/img/icons/girl2.svg");
    background-size: 70px;
    background-position: top right;
    background-repeat: no-repeat;
    h4 {
      margin-top: 5px;
      font-size: 40px;
    }
    b {
      font-size: 24px;
      margin-top: -25px;
    }
    ul{
        padding-left: 15px;
        li {
            display: grid;
            grid-template-columns: 15px auto 100px;
            list-style-type: none;
            strong {
                padding: 0 10px;
                max-width: 160px;
                width: 100%;
            }
        }
    }
  }
  </style>
  