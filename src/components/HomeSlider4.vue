<template>
    <BaseSlider
      v-if="features && features.length > 0"
      title=""
      :items="features"
      sliderId="features-slider"
      containerClass="container features-section"
    >
      <template v-slot:default="{ item }">
        <div class="info">
          <div class="icon">
            <img v-if="item.image" :src="item.image" :alt="item.title" />
          </div>
          <div>
            <b>{{ item.title }}</b><br />
            <span>{{ item.text }}</span>
          </div>
        </div>
      </template>
    </BaseSlider>
  </template>
  
  <script>
  import BaseSlider from "@/components/BaseSlider.vue";
  
  export default {
    components: { BaseSlider },
    props: {
      features: {
        type: Array,
        required: true,
        default: () => [],
      },
    },
  };
  </script>
  