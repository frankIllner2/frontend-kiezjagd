<template>
  <div class="admin-container">
    <div class="logout">
      <h2>🔒 Admin-Bereich</h2>
      <button @click="logout">Logout</button>
      <router-view />
    </div>
    <!-- Sidebar für Navigation -->
    <aside class="sidebar">
      <button @click="currentView = 'list'">Alle Spiele</button>
      <button @click="currentView = 'new'">Neues Spiel</button>
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

          <ul class="margin-top-2">
            <li><b>Top 5 Teams</b></li>
            <li v-for="team in game.ranking" :key="team.teamName">
              {{ team.teamName }} - {{ team.duration }}
            </li>
          </ul>

          <div class="game-actions">
            <router-link
              :to="`/game/${game.encryptedId}?from=admin`"
              target="_blank"
              class="link-button"
            >
              Zum Spiel
            </router-link>
            <button @click="editGame(game)">Bearbeiten</button>
            <button @click="deleteGame(game._id)">Löschen</button>
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
    </section>
  </div>
</template>

<script>
import GameForm from "@/components/GameForm.vue";
import GameEditForm from "@/components/GameEditForm.vue";
import { apiService } from "@/services/apiService";

export default {
  components: { GameForm, GameEditForm },
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
        const games = await apiService.fetchGames();
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
      await apiService.createGame(game);
      this.fetchGames();
      this.currentView = "list";
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
    },
    cancelEdit() {
      this.selectedGame = null;
      this.currentView = "list";
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/admin/login');
    }
  },
  mounted() {
    this.fetchGames();
  },
};
</script>

<style scoped>

.logout {
  display: inline-flex;
  flex-direction: column-reverse;
}

/* Allgemeine Container-Stile */
.admin-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

/* Sidebar-Stile */
.sidebar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.sidebar button {
  background: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.sidebar button:hover {
  background: #388e3c;
}

/* Inhaltsbereich */
.content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

/* Spieleliste */
.game-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

/* Spielkarte */
.game-card {
  background: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  width: 100%;
  max-width: 450px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.game-card h3 {
  margin-bottom: 10px;
  font-size: 1.2rem;
  color: #333;
}

.game-card p {
  margin: 5px 0;
  font-size: 0.9rem;
}

.game-card h4 {
  margin-top: 10px;
  font-size: 1rem;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

ul li {
  font-size: 0.9rem;
  margin: 3px 0;
}

/* Aktionen */
.game-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.link-button {
  background-color: #2196f3;
  color: white;
  text-decoration: none;
  padding: 10px;
  border-radius: 4px;
}

.link-button:hover {
  background-color: #1976d2;
}

button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #ddd;
}

/* Responsive Design */
@media (min-width: 768px) {
  .game-card {
    width: calc(50% - 20px);
  }
}

@media (max-width: 767px) {
  .game-card {
    width: 100%;
  }
}
</style>
