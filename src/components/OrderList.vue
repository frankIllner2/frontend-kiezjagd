<template>
    <div class="orders-list">
      <h2>Bestellungen</h2>
      <div v-if="orders.length === 0" class="no-orders">
        <p>Keine Bestellungen gefunden.</p>
      </div>
      <div v-for="order in orders" :key="order._id" class="order-card" >
        <h3>{{ order.gameName }}</h3>
        <p><strong>Kunde:</strong> {{ order.email }}</p>
        <p><strong>Gekauft am:</strong> {{ formatEndTime(order.createdAt) }}</p>
        <p><strong>Spiel-ID:</strong> {{ order.gameId }}</p>
        <p :class="getStatusClass(order)"><strong>Zahlstatus:</strong> {{ order.paymentStatus }}</p>
        <p
            :class="{ expired: isLinkExpired(order.endTime) }"
            >
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
  
  <style scoped>
  .orders-list {
    padding: 1rem;
  }
  
  .orders-list {
    position: relative;
    width: 1220px;
  }
  .order-card {
    display: inline-block;
    margin: 15px;
    width: 25%;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: #FFF;
  }
  
    /* Farbmarkierungen basierend auf Zahlungsstatus */
    .status-paid {
    border-color:#e8f5e9 ;
    background-color: #4caf50;
    }

    .status-pending {
    border-color: #fffde7;
    background-color: #ffeb3b;
    }

    .status-other {
    border-color: #f44336;
    background-color: #f44336;
    }

    /* Ablaufdatum-Status */
    .expired {
    color: #f44336;
    font-weight: bold;
    }

    .no-orders {
    text-align: center;
    color: #999;
    }
  .no-orders {
    text-align: center;
    color: #999;
  }


  @media (max-width: 767px) {
    .order-card {
        width: 100%;
    }
  }

  </style>
  