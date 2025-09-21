<template>
  <div id="app">
    <!-- Globaler Toast-Host -->
    <ToastMessage ref="toast" />

    <!-- App-Content -->
    <router-view />

    <!-- Vercel Speed Insights: am Ende des Root-Layouts -->
    <SpeedInsights />
  </div>
</template>

<script>
import ToastMessage from "@/components/ToastMessage.vue";
import { SpeedInsights } from "@vercel/speed-insights/vue";

export default {
  name: "App",
  components: { ToastMessage, SpeedInsights },

  methods: {
    showToast(message, type = "success", duration = 6000) {
      this.$refs.toast?.showToast?.(message, type, duration);
    },
  },

  provide() {
    return { showToast: this.showToast };
  },
};
</script>
