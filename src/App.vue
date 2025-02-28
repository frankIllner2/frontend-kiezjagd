<template>
  <div>
    <Toast ref="toast" />
    <router-view />
  </div>
</template>

<script>
import Toast from "@/components/ToastMessage.vue";

export default {
  components: { Toast },
  methods: {
    showToast(message, type = "success") {
      console.log("showToast wurde aufgerufen:", message, type); 
      this.$refs.toast.showToast(message, type);
      
    },
  },
};
</script>
