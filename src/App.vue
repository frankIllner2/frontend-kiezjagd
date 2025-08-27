<template>
  <div id="app">
    <!-- Globaler Toast-Host -->
    <ToastMessage ref="toast" />

    <!-- App-Content -->
    <router-view />
  </div>
</template>

<script>
import ToastMessage from "@/components/ToastMessage.vue";

export default {
  name: "App",
  components: { ToastMessage },

  methods: {
    showToast(message, type = "success", duration = 6000) {
      // Weiterleitung an die Kind-Komponente
      this.$refs.toast?.showToast?.(message, type, duration);
    },
  },

  // stellt showToast für ALLE Kinder bereit
  provide() {
    return { showToast: this.showToast };
  },
};
</script>

