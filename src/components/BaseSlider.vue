<template>
    <section :id="sliderId" :class="containerClass">
      <h2>{{ title }}</h2>
      <div class="glide" ref="slider">
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
      console.log('next');
      return this.items && this.items.length > this.perView && this.currentIndex < this.items.length - this.perView;
    },
    canPrev() {
      console.log('prev');
      return this.currentIndex > 0;
    },
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
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
    console.log("updatePerView:", this.perView);
  },
  handleResize() {
    console.log("Resize detected, updating slider...");
    this.updatePerView(); // 🔥 Fix: Methode ist jetzt sicher vorhanden
    setTimeout(() => {
      this.correctIndex();
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
  correctIndex() {
    if (this.currentIndex > this.items.length - this.perView) {
      this.currentIndex = Math.max(0, this.items.length - this.perView);
    }
  },
  updateSlider(animate = true) {
    if (!this.$refs.slides || !this.$refs.slider) return;

    const sliderWidth = this.$refs.slider.offsetWidth;
    if (!sliderWidth || sliderWidth < 50) {
      console.warn("Slider width ist ungültig:", sliderWidth);
      return;
    }

    const totalGaps = (this.perView - 1) * this.gap;
    let slideWidth = Math.floor((sliderWidth - totalGaps) / this.perView);
    slideWidth = Math.max(250, Math.min(slideWidth, 500));

    console.log("sliderWidth:", sliderWidth, "slideWidth:", slideWidth, "perView:", this.perView);

    const slideItems = this.$refs.slides.children;
    for (let slide of slideItems) {
      slide.style.width = `${slideWidth}px`;
    }

    this.correctIndex();

    const offset = this.currentIndex * (slideWidth + this.gap);
    this.$refs.slides.style.transition = animate ? "transform 0.4s ease-in-out" : "none";
    this.$refs.slides.style.transform = `translateX(-${offset}px)`;
  }
},
mounted() {
  console.log("🚀 BaseSlider mounted!");
  this.updatePerView(); // 🔥 Fix: Diese Methode existiert jetzt sicher
  setTimeout(() => {
    this.updateSlider(false);
  }, 200);
  window.addEventListener("resize", this.handleResize);
}
};
</script>

  <style>
  /* Gleiche CSS-Stile für den Slider */
  .glide {
    position: relative;
    max-width: 100%;
    overflow: hidden;
  }
  .glide__slides {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    gap: 20px;
    transition: transform 0.4s ease-in-out;
  }
  .glide__slide {
    flex: 0 0 auto;
    text-align: center;
    min-height: 400px;
    min-width: 412px;
  }
  .glide__arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: #FAC227;
    color: #355b4c;
    border: 1px solid #355b4c;
    cursor: pointer;
    padding: 10px;
    z-index: 10;
    border-radius: 10px;
    svg {
      font-size: 20px;
    }
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
  </style>