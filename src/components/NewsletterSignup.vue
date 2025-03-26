<template>
    <transition name="slide-up">
      <div class="newsletter-form" v-if="visible">
        <form @submit.prevent="submit">
          <input
            type="email"
            v-model="email"
            placeholder="Deine E-Mail"
            required
          />
          <button class="btn btn--secondary" type="submit">Jetzt anmelden</button>
          <p class="unsubscribe-link" @click="unsubscribe">Abmelden</p>
          <span class="close-btn" @click="$emit('close')">
            <font-awesome-icon
                  icon="minus-circle"
                  class="close-icon-2"
                  aria-label="Schließen"
                />
            </span>
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
      };
    },
    methods: {
      async submit() {
        try {
          await apiService.subscribeToNewsletter(this.email);
          alert("Danke für deine Anmeldung!");
          this.email = "";
          this.$emit("close");
        } catch (error) {
          alert("❌ Anmeldung fehlgeschlagen.");
          console.error(error);
        }
      },
      async unsubscribe() {
        const emailToUnsub = prompt("Gib deine E-Mail zur Abmeldung ein:");
        if (!emailToUnsub) return;
  
        try {
          await apiService.unsubscribeFromNewsletter(emailToUnsub);
          alert("Du wurdest abgemeldet.");
        } catch (error) {
          alert("❌ Abmeldung fehlgeschlagen.");
          console.error(error);
        }
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
  