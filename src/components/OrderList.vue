<template>
  <div class="orders">
    <!-- Controls -->
    <div class="orders-controls">
      <div class="search-row">
        <input
          id="order-search"
          name="order-search"
          v-model.trim="search"
          class="input"
          type="text"
          :placeholder="placeholderBy(searchBy)"
          @input="onSearchInput"
        />

        <select
          id="order-search-by"
          name="order-search-by"
          v-model="searchBy"
          class="select"
          @change="onSearchChange"
        >
          <option value="email">E-Mail</option>
          <option value="gameId">Spiel-ID</option>
          <option value="date">Datum (YYYY-MM-DD)</option>
        </select>

        <select
          id="order-page-size"
          name="order-page-size"
          v-model.number="pageSize"
          class="select"
          @change="goToPage(1)"
        >
          <option :value="10">10 / Seite</option>
          <option :value="20">20 / Seite</option>
          <option :value="50">50 / Seite</option>
        </select>
      </div>

      <div class="meta-row">
        <span v-if="total">Gefunden: {{ total }} Bestellung(en)</span>
        <span v-else>&nbsp;</span>
        <div class="pager" role="navigation" aria-label="Bestellungen paginieren">
          <button class="btn" :disabled="page === 1" @click="goToPage(1)" aria-label="Erste Seite">«</button>
          <button class="btn" :disabled="page === 1" @click="goToPage(page - 1)" aria-label="Vorherige Seite">‹</button>
          <span>Seite {{ page }} / {{ totalPages }}</span>
          <button class="btn" :disabled="page === totalPages" @click="goToPage(page + 1)" aria-label="Nächste Seite">›</button>
          <button class="btn" :disabled="page === totalPages" @click="goToPage(totalPages)" aria-label="Letzte Seite">»</button>
        </div>
      </div>
    </div>

    <!-- Liste -->
    <div class="orders-list">
      <div v-if="items && items.length === 0" class="no-orders">
        <p>Keine Bestellungen gefunden.</p>
      </div>

      <div v-for="order in (items || [])" :key="order._id" class="order-card">
        <b>{{ order.gameName || '—' }}</b>
        <p v-if="order.invoiceNumber"><strong>Rechnungsnr.:</strong> {{ order.invoiceNumber }}</p>
        <p><strong>Kunde:</strong> {{ order.email }}</p>
        <p><strong>Gekauft am:</strong> {{ formatDT(order.createdAt || order.createdTime) }}</p>
        <p><strong>Spiel-ID:</strong> {{ order.gameId }}</p>
        <p :class="statusClass(order.paymentStatus)">
          <strong>Zahlstatus:</strong> {{ order.paymentStatus }}
        </p>
        <p :class="{ expired: isExpired(order.endTime) }">
          <strong>Link gültig bis:</strong> {{ formatDT(order.endTime) }}
        </p>
      </div>
    </div>

    <!-- Pager unten -->
    <div class="meta-row bottom" v-if="totalPages > 1">
      <div class="pager" role="navigation" aria-label="Bestellungen paginieren">
        <button class="btn" :disabled="page === 1" @click="goToPage(1)" aria-label="Erste Seite">«</button>
        <button class="btn" :disabled="page === 1" @click="goToPage(page - 1)" aria-label="Vorherige Seite">‹</button>
        <span>Seite {{ page }} / {{ totalPages }}</span>
        <button class="btn" :disabled="page === totalPages" @click="goToPage(page + 1)" aria-label="Nächste Seite">›</button>
        <button class="btn" :disabled="page === totalPages" @click="goToPage(totalPages)" aria-label="Letzte Seite">»</button>
      </div>
    </div>
  </div>
</template>

<script>
import { apiService } from "@/services/apiService";

export default {
  name: "OrderList",
  data() {
    return {
      // Query/UI-State
      page: 1,
      pageSize: 20,
      total: 0,
      items: [],

      search: "",
      searchBy: "email", // email | gameId | date

      // ESLint-safe (kein führender Unterstrich)
      debounceTimer: null,
    };
  },
  computed: {
    totalPages() {
      return this.total > 0 ? Math.ceil(this.total / this.pageSize) : 1;
    },
  },
  methods: {
    placeholderBy(type) {
      if (type === "gameId") return "Spiel-ID suchen …";
      if (type === "date") return "Datum: 2025-01-15 oder 2025-01-15..2025-01-20";
      return "E-Mail suchen …";
    },
    formatDT(v) {
      return v ? new Date(v).toLocaleString() : "—";
    },
    isExpired(endTime) {
      return endTime ? new Date(endTime) < new Date() : false;
    },
    statusClass(status) {
      return {
        "status-paid": status === "paid",
        "status-pending": status === "pending",
        "status-other": status !== "paid" && status !== "pending",
      };
    },
    async fetchOrders() {
      try {
        const params = {
          page: this.page,
          limit: this.pageSize,
          search: this.search || undefined,
          searchBy: this.searchBy || undefined,
          sort: "-createdAt", // neueste zuerst
        };
        const res = await apiService.fetchOrders(params);
        this.items = res.items || [];
        this.total = Number(res.total) || 0;
        this.page = Number(res.page) || 1;
      } catch (e) {
        console.error("Fehler beim Laden der Bestellungen:", e);
        this.items = [];
        this.total = 0;
      }
    },
    goToPage(p) {
      const next = Math.min(Math.max(1, p), this.totalPages);
      if (next !== this.page) {
        this.page = next;
        this.fetchOrders();
      } else if (p === 1 || p === this.totalPages) {
        // z.B. nach pageSize-Wechsel am Rand neu laden
        this.fetchOrders();
      }
    },
    onSearchInput() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.page = 1;
        this.fetchOrders();
      }, 300);
    },
    onSearchChange() {
      this.search = "";
      this.page = 1;
      this.fetchOrders();
    },
  },
  mounted() {
    this.fetchOrders();
  },
};
</script>

<style scoped lang="scss">
$primary-text-color: #355b4c;
$secondary-text-color: #fac227;

.orders {
  width: 1024px;
  max-width: 100%;
  color: $primary-text-color;
}

.orders-controls {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;

  .search-row {
 display: grid;
  grid-template-columns: 2fr 1fr 1fr; // Input doppelt so breit
  gap: 0.5rem;
  }

  .meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: $primary-text-color;
    font-size: 0.95rem;

    &.bottom {
      margin-top: 1rem;
    }
  }
}


.input:focus,
.select:focus {
  outline: none;
  border-color: $primary-text-color;
  box-shadow: 0 0 0 2px rgba(53, 91, 76, 0.1);
}

.btn {
  cursor: pointer;
  min-width: 2.2rem;
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
}

.pager {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.order-card {
  border: 1px solid rgba(53, 91, 76, 0.15);
  border-left: 4px solid $secondary-text-color;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  background: #fff;

  b {
    color: $primary-text-color;
  }
  p {
    margin: 0.15rem 0;
  }
}

.status-paid {
  color: #1b7f3a;
  font-weight: 600;
}
.status-pending {
  color: #a06a00;
  font-weight: 600;
}
.status-other {
  color: #555;
  font-weight: 600;
}
.expired {
  color: #9b2c2c;
}
.no-orders {
  text-align: center;
  padding: 2rem 0;
  color: #666;
}
</style>
