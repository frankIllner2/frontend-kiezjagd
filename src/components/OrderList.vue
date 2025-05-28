<template>
  <div class="orders-list">
    <h2>Bestellungen</h2>
    <div v-if="orders.length === 0" class="no-orders">
      <p>Keine Bestellungen gefunden.</p>
    </div>
    <div v-for="order in orders" :key="order._id" class="order-card">
      <h3>{{ order.gameName }}</h3>
      <h4>{{ order.invoiceNumber }}</h4>
      <p><strong>Kunde:</strong> {{ order.email }}</p>
      <p><strong>Gekauft am:</strong> {{ formatEndTime(order.createdAt) }}</p>
      <p><strong>Spiel-ID:</strong> {{ order.gameId }}</p>
      <p :class="getStatusClass(order)">
        <strong>Zahlstatus:</strong> {{ order.paymentStatus }}
      </p>
      <p :class="{ expired: isLinkExpired(order.endTime) }">
        <strong>Link gültig bis:</strong> {{ formatEndTime(order.endTime) }}
      </p>
    </div>
  </div>
</template>

<script>
import { apiService } from "@/services/apiService";

export default {
  name: "OrderList",
  data() {
    return {
      orders: [],
    };
  },
  methods: {
    async fetchOrders() {
      try {
        const orders = await apiService.fetchOrders();
        this.orders = orders;
      } catch (error) {
        console.error("Fehler beim Laden der Bestellungen:", error);
      }
    },
    formatEndTime(endTime) {
      return new Date(endTime).toLocaleString();
    },
    isLinkExpired(endTime) {
      return new Date(endTime) < new Date();
    },
    getStatusClass(order) {
      switch (order.paymentStatus) {
        case "paid":
          return "status-paid";
        case "pending":
          return "status-pending";
        default:
          return "status-other";
      }
    },
  },
  mounted() {
    this.fetchOrders();
  },
};
</script>