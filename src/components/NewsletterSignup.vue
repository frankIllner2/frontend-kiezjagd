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
  
  <style scoped>
  .slide-up-enter-active, .slide-up-leave-active {
    transition: all 0.4s ease;
  }
  .slide-up-enter-from, .slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
  }
  .newsletter-form {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #FAC227;
    padding: 1rem;
    z-index: 1000;
    p {
        color: #355b4c;
    }
  }
  .newsletter-form.unsub-mode {
    button {
        background-color: #f00713;
    }

  }
  input[type="email"] {
    padding: 0.5rem;
    width: 70%;
    margin-right: 1rem;
  }
  .newsletter-form form {
    text-align: left;
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    justify-content: space-around;
    flex-direction: column;
    box-shadow: none;
  }
  
  .newsletter-form form button {
    margin: 20px 0;
  }

  .unsubscribe-link {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #888;
    cursor: pointer;
  }
  </style>
  