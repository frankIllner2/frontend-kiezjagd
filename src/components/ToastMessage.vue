<template>
    <div class="toast" :class="[type]" v-show="visible">
      <p>{{ message }}</p>
    </div>
</template>
<script>
export default {
  data() {
    return {
      message: "",
      type: "success",
      visible: false,
    };
  },
  methods: {
    showToast(message, type = "success") {
      console.log("Toast wurde aufgerufen mit:", message, type); // 🔍 Debugging
      this.message = message;
      this.type = type;
      this.visible = true;
      console.log("visible Status:", this.visible); // Prüfe, ob visible wirklich true wird

      setTimeout(() => {
        this.visible = false;
        console.log("Toast wird nach 5s wieder versteckt");
      }, 6000);
    },
  },
};
</script>
