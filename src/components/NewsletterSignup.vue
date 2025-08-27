<template>
  <!-- appear: animiert auch beim ersten Einblenden -->
  <transition name="slide-up" appear>
    <div
      class="newsletter-form"
      :class="{ 'unsub-mode': isUnsubscribing }"
      v-if="visible"
      role="dialog"
      aria-modal="true"
      aria-label="Newsletter"
    >
      <form @submit.prevent="submit" class="newsletter-form__form">
        <label class="sr-only" for="newsletter-email">E-Mail</label>
        <input
          id="newsletter-email"
          type="email"
          v-model="email"
          placeholder="Deine E-Mail"
          required
          autocomplete="email"
          inputmode="email"
        />

        <button class="btn btn--secondary" type="submit">
          {{ isUnsubscribing ? "Jetzt abmelden" : "Jetzt anmelden" }}
        </button>

        <p class="toggle-link" @click="toggleMode">
          {{ isUnsubscribing ? "Wieder anmelden?" : "Jetzt abmelden" }}
        </p>

        <button
          class="close-btn"
          type="button"
          aria-label="Schließen"
          @click="$emit('close')"
        >
          ✖
        </button>
      </form>
    </div>
  </transition>
</template>

<script>
import { nextTick } from "vue";
import { apiService } from "@/services/apiService";

export default {
  name: "NewsletterSignup",
  props: {
    visible: { type: Boolean, required: true },
  },

  // showToast aus App.vue via provide/inject
  inject: ["showToast"],

  data() {
    return {
      email: "",
      isUnsubscribing: false,
      isLoading: false,
    };
  },

  methods: {
    async submit() {
      if (this.isLoading) return;
      this.isLoading = true;

      try {
        if (this.isUnsubscribing) {
          await apiService.unsubscribeFromNewsletter(this.email);
          this.showToast?.("Du wurdest abgemeldet.", "success");
          this.isUnsubscribing = false;
        } else {
          await apiService.subscribeToNewsletter(this.email);
          this.showToast?.("Danke für deine Anmeldung!", "success");
        }

        this.email = "";
        // Toast rendern lassen, dann schließen
        await nextTick();
        this.$emit("close");
      } catch (error) {
        console.error("❌ Fehler beim Senden des Formulars:", error);
        const msg =
          error?.response?.data?.message ||
          (this.isUnsubscribing ? "Abmeldung fehlgeschlagen." : "Anmeldung fehlgeschlagen.");
        this.showToast?.(msg, "error");
      } finally {
        this.isLoading = false;
      }
    },

    toggleMode() {
      this.isUnsubscribing = !this.isUnsubscribing;
    },
  },
};
</script>

