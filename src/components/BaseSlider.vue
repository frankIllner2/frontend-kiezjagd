<template>
    <section :id="sliderId" :class="containerClass">
      <h2>{{ title }}</h2>
      <div 
        @touchstart="touchStart" 
        @touchmove="touchMove" 
        @touchend="touchEnd"  
        class="glide" 
        ref="slider"
      >
        <button v-if="canPrev" class="glide__arrow glide__arrow--left" @click="prevSlide"><font-awesome-icon icon="arrow-left" /></button>
        <div class="glide__track">
          <ul class="glide__slides" ref="slides">
            <li v-for="(item, index) in items" :key="index" class="glide__slide card">
              <slot :item="item" :index="index"></slot>
            </li>
          </ul>
        </div>
  
        <button v-if="canNext" class="glide__arrow glide__arrow--right" @click="nextSlide"><font-awesome-icon icon="arrow-right" /></button>
      </div>
  
      <div class="slide-position">
        {{ visibleCount }} / {{ totalSlides }}
      </div>
    </section>
  </template>

  <script>
export default {
  props: {
    title: String,
    items: Array,
    sliderId: String,
    containerClass: String,
  },
  data() {
    return {
      currentIndex: 0,
      perView: 1,
      gap: 20,
      touchStartX: 0, // Für Touch-Gesten
      touchEndX: 0,
      isSwiping: false, // ✅ Verhindert Next-Slide bei Klick auf eine Card
    };
  },
  computed: {
    totalSlides() {
      return this.items.length;
    },
    visibleCount() {
      return Math.min(this.currentIndex + this.perView, this.totalSlides);
    },
    canNext() {
      return this.currentIndex < this.items.length - this.perView;
    },
    canPrev() {
      return this.currentIndex > 0;
    },
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
    },
    handleResize() {
      this.updatePerView();
      setTimeout(() => {
        this.correctIndex();
        this.updateSlider(false);
      }, 100);
    },

    // ✅ **Fix: Next-Slide geht jetzt nur um 1 Schritt**
    nextSlide() {
      if (this.canNext) {
        this.currentIndex += 1; // 🔥 Nur um 1 erhöhen!
        this.updateSlider();
      }
    },
    
    prevSlide() {
      if (this.canPrev) {
        this.currentIndex -= 1;
        this.updateSlider();
      }
    },

    correctIndex() {
      if (this.currentIndex > this.items.length - this.perView) {
        this.currentIndex = Math.max(0, this.items.length - this.perView);
      }
    },

    updateSlider(animate = true) {
      if (!this.$refs.slides || !this.$refs.slider) return;

      const sliderWidth = this.$refs.slider.offsetWidth;
      if (!sliderWidth || sliderWidth < 50) {
        return;
      }

      const totalGaps = (this.perView - 1) * this.gap;
      let slideWidth = Math.floor((sliderWidth - totalGaps) / this.perView);
      slideWidth = Math.max(250, Math.min(slideWidth, 500));

      const slideItems = this.$refs.slides.children;
      for (let slide of slideItems) {
        slide.style.width = `${slideWidth}px`;
      }

      this.correctIndex();

      const offset = this.currentIndex * (slideWidth + this.gap);
      this.$refs.slides.style.transition = animate ? "transform 0.4s ease-in-out" : "none";
      this.$refs.slides.style.transform = `translateX(-${offset}px)`;
    },

    // ✅ **Fix: Swipen ohne Link/Button-Klick**
    touchStart(event) {
      this.touchStartX = event.touches[0].clientX;
      this.isSwiping = false; // Beim Start zurücksetzen
    },
    touchMove(event) {
      this.touchEndX = event.touches[0].clientX;
      this.isSwiping = true; // Nutzer hat bewegt → Swipen erlaubt
    },
    touchEnd(event) {
      console.log(event);
      if (!this.isSwiping) return; // 🔥 Kein Swipe → Keine Aktion

      const swipeDistance = this.touchStartX - this.touchEndX;
      if (swipeDistance > 50) {
        this.nextSlide(); // 👉 Swipe nach links → Nächster Slide
      } else if (swipeDistance < -50) {
        this.prevSlide(); // 👈 Swipe nach rechts → Vorheriger Slide
      }
    }
  },
  mounted() {
    this.updatePerView();
    setTimeout(() => {
      this.updateSlider(false);
    }, 200);
    window.addEventListener("resize", this.handleResize);
  }
};
</script>