<template>
  <div
    class="toast"
    :class="[
      type,     
      visible ? 'visible' : 'hidden'
    ]"
    role="status"
    aria-live="polite"
  >
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: "ToastMessage",
  data() {
    return {
      message: "",
      type: "success",     // success | error | info
      visible: false,
      timer: null,
      defaultDuration: 6000,
    };
  },
  methods: {
    showToast(message, type = "success", duration = this.defaultDuration) {
      // Mehrfachaufrufe sauber handhaben (Reset)
      clearTimeout(this.timer);

      this.message = message;
      this.type = type;
      this.visible = true;

      this.timer = setTimeout(() => {
        this.visible = false;
      }, duration);
    },
  },
  beforeUnmount() {
    clearTimeout(this.timer);
  },
};
</script>

<style scoped>
/* Position: oben rechts, über Modals/Overlays */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 220px;
  max-width: 90vw;
  padding: 12px 16px;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0,0,0,.18);
  color: #fff;
  font-weight: 600;
  line-height: 1.3;
  z-index: 99999; /* wichtig: über Backdrop/Drawer etc. */
  transition: opacity .3s ease, transform .3s ease;
}

/* Ein-/Ausblend-States */
.toast.hidden {
  opacity: 0;
  transform: translateY(-20px);
}
.toast.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Varianten nach type */
.toast.success { background-color: #4caf50; } /* grün */
.toast.error   { background-color: #c0392b; } /* rot */
.toast.info    { background-color: #2f86c9; } /* blau */
</style>
