<template>
    <transition name="slide-up">
      <div class="newsletter-form" :class="{ 'unsub-mode': isUnsubscribing }" v-if="visible">
        <form @submit.prevent="submit">
            <input
                type="email"
                v-model="email"
                placeholder="Deine E-Mail"
                required
            />

            <button class="btn btn--secondary" type="submit">
                {{ isUnsubscribing ? "Jetzt abmelden" : "Jetzt anmelden" }}
            </button>

            <p class="toggle-link" @click="toggleMode">
                {{ isUnsubscribing ? "Wieder anmelden?" : "Jetzt abmelden" }}
            </p>

            <span class="close-btn" @click="$emit('close')">✖</span>
            </form>
      </div>
    </transition>
  </template>
  
  <script>
  import { apiService } from "@/services/apiService";
  
  export default {
    name: "NewsletterSignup",
    props: {
      visible: {
        type: Boolean,
        required: true,
      },
    },
    data() {
      return {
        email: "",
        isUnsubscribing: false,
      };
    },
    methods: {
        async submit() {
            try {
            if (this.isUnsubscribing) {
                await apiService.unsubscribeFromNewsletter(this.email);
                this.$root.showToast("📭 Du wurdest abgemeldet.");
                this.isUnsubscribing = false;
            } else {
                await apiService.subscribeToNewsletter(this.email);
                this.$root.showToast("🎉 Danke für deine Anmeldung!");
            }

            this.email = "";
            this.$emit("close");
            } catch (error) {
            console.error("❌ Fehler beim Senden des Formulars:", error);
            const message =
                error?.response?.data?.message ||
                (this.isUnsubscribing ? "Abmeldung fehlgeschlagen." : "Anmeldung fehlgeschlagen.");
            this.$root.showToast(message, "error");
            }
        },
        toggleMode() {
            this.isUnsubscribing = !this.isUnsubscribing;
        },
    },
  };
  </script>