<template>
    <button @click="startCheckout">Spiel kaufen</button>
</template>
  
  <script>
  import { loadStripe } from '@stripe/stripe-js';
  import axios from 'axios';
  
  export default {
    methods: {
      async startCheckout() {
        const stripe = await loadStripe(process.env.VUE_APP_STRIPE_PUBLIC_KEY);
  
        try {
          const response = await axios.post('/api/checkout/create-checkout-session', {
            email: this.email,
          });
          const sessionId = response.data.sessionId;
  
          await stripe.redirectToCheckout({ sessionId });
        } catch (error) {
          console.error('❌ Fehler beim Checkout:', error);
        }
      },
    },
  };
  </script>
  