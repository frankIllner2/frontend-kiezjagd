<template>
  <div class="admin-container">
    <div class="logout">
      <h2>🔒 Admin-Bereich</h2>
      <button class="btn btn--logout" @click="logout">Logout</button>
      <router-view />
    </div>
    <!-- Sidebar für Navigation -->
    <aside class="sidebar">
      <button @click="currentView = 'list'">Alle Spiele</button>
      <button @click="currentView = 'new'">Neues Spiel</button>
      <button @click="currentView = 'orders'">Bestellungen</button>
    </aside>

    <!-- Inhaltsbereich -->
    <section class="content">
      <!-- Spieleliste -->
      <div v-if="currentView === 'list'" class="game-list">
        <div v-for="game in games" :key="game._id" class="game-card">
          <h3>{{ game.name }}</h3>
          <p><strong>Stadt:</strong> {{ game.city }}</p>
          <p><strong>Altersgruppe:</strong> {{ game.ageGroup }}</p>
          <p><strong>Anzahl der Fragen:</strong> {{ game.questions.length }}</p>
          <p><strong>QR-Code:</strong>/spiel/{{ game.encryptedId }}</p>

          <ul class="margin-top-2">
            <li><span class="underline">Top 5 Teams</span></li>
            <li v-for="team in game.ranking" :key="team.teamName">
              {{ team.teamName }} - {{ team.duration }}
            </li>
          </ul>

          <div class="game-actions">
            <router-link
              :to="`/admin/game/${game.encryptedId}?from=admin`"
              target="_blank"
              class="link-button"
            >
              Zum Spiel
            </router-link>
            <button @click="editGame(game)"><font-awesome-icon icon="edit" /></button>
            <button @click="deleteGame(game._id)">
              <font-awesome-icon icon="trash" />
            </button>
          </div>
        </div>
      </div>

      <!-- Neues Spiel hinzufügen -->
      <GameForm v-if="currentView === 'new'" :game="newGame" @save="createGame" />

      <!-- Spiel bearbeiten -->
      <GameEditForm
        v-if="currentView === 'edit'"
        :game="selectedGame"
        @save="updateGame"
        @cancel="cancelEdit"
      />

      <!-- Bestellungen -->
      <OrderList v-if="currentView === 'orders'" />
    </section>
  </div>
</template>

<script>
import GameForm from "@/components/GameForm.vue";
import GameEditForm from "@/components/GameEditForm.vue";
import OrderList from "@/components/OrderList.vue";
import { apiService } from "@/services/apiService";

export default {
  components: { GameForm, GameEditForm, OrderList },
  data() {
    return {
      currentView: "list",
      games: [],
      newGame: { city: "", name: "", ageGroup: "" },
      selectedGame: null,
    };
  },
  name: "AdminPage",
  methods: {
    async fetchGames() {
      try {
        const games = await apiService.fetchAllGames();
        // Lade Ranking und Fragenanzahl für jedes Spiel
        for (const game of games) {
          const ranking = await apiService.fetchRanking(game.encryptedId);
          game.ranking = ranking || [];
        }
        this.games = games;
      } catch (error) {
        console.error("Fehler beim Laden der Spiele:", error);
      }
    },
    async createGame(game) {
      try {
        const gameData = { ...game };  // Nimm die Daten direkt
        await apiService.createGame(gameData);
        this.fetchGames();
        this.currentView = 'list';
        this.$root.showToast("Daten wurden erfolgreich gespeichert!");
      } catch (err) {
        this.$root.showToast("Fehler beim Erstellen des Spiels!!");
        console.error('Fehler beim Erstellen des Spiels:', err);
      }
    },
    editGame(game) {
      if (!game.encryptedId) {
        console.error("Fehler: encryptedId ist undefined");
        return;
      }
      this.$router.push({ name: "EditGame", params: { id: game.encryptedId } });
    },
    async updateGame(game) {
      await apiService.updateGame(game);
      this.fetchGames();
      this.currentView = "list";
    },
    async deleteGame(game_id) {
      if (!game_id) {
        console.error("Fehler: game_id ist undefined");
        return;
      }
      await apiService.deleteGame(game_id);
      this.fetchGames();
      this.$root.showToast("Spiel wurde erfolgreich gelöscht!");
    },
    cancelEdit() {
      this.selectedGame = null;
      this.currentView = "list";
    },
    logout() {
      localStorage.removeItem("token");
      this.$router.push("/admin/login");
    },
  },
  mounted() {
    this.fetchGames();
  },
};
</script>
