<template>
  <div class="admin-container">
    <div class="logout">
      <h3>Kiezjagd-Admin</h3>
      <button class="btn btn--logout" @click="logout">Logout</button>
      <router-view />
    </div>

    <!-- Top-Navigation -->
    <nav class="topbar">
      <button 
        @click="currentView = 'list'" 
        :class="{ active: currentView === 'list' }"
      >
        Alle Spiele
      </button>
      <button 
        @click="currentView = 'new'" 
        :class="{ active: currentView === 'new' }"
      >
        Neues Spiel
      </button>
      <button 
        @click="currentView = 'orders'" 
        :class="{ active: currentView === 'orders' }"
      >
        Bestellungen
      </button>
      <button 
        @click="currentView = 'newsletter'" 
        :class="{ active: currentView === 'newsletter' }"
      >
        Newsletter
      </button>
    </nav>

    <!-- Inhaltsbereich -->
    <section class="content">
      <!-- Spieleliste -->
      <div v-if="currentView === 'list'" class="game-list">
        <div
          v-for="game in games"
          :key="game._id"
          class="game-card"
          :class="{ 'disabled-border': game.isDisabled, 'enabled-border': !game.isDisabled }"
        >
          <!-- Header mit Toggle -->
          <div
            class="game-card-header"
            role="button"
            tabindex="0"
            :aria-controls="`body-${game._id}`"
            :aria-expanded="expandedId === game._id"
            @click="toggleGame(game)"
            @keydown.enter.prevent="toggleGame(game)"
            @keydown.space.prevent="toggleGame(game)"
          >
            <h3 class="game-card-title">{{ game.name }}</h3>

            <div class="game-card-header-actions">
              <span class="toggle-icon" :title="expandedId === game._id ? 'Zuklappen' : 'Aufklappen'">
                {{ expandedId === game._id ? '−' : '+' }}
              </span>
            </div>
          </div>

          <!-- Einklappbarer Bereich -->
          <transition
            @enter="onEnter"
            @after-enter="onAfterEnter"
            @leave="onLeave"
          >
            <div
              v-if="expandedId === game._id"
              class="game-card-body"
              :id="`body-${game._id}`"
            >
              <div class="grid--info">
                <p><strong>Stadt:</strong> {{ game.city }}</p>
                <p><strong>Altersgruppe:</strong> {{ game.ageGroup }}</p>
                <p><strong>Anzahl der Fragen:</strong> {{ game.questionsCount ?? game.questions?.length ?? 0 }}</p>
              </div>

              <p class="mt-1">
                <strong>
                  <router-link
                    :to="`/spiel/${game.encryptedId}`"
                    target="_blank"
                    class="button"
                    @click.stop
                  >
                    zur Landingpage
                  </router-link>
                </strong>
              </p>

              <!-- Ranking nur rendern, wenn vorhanden -->
              <ul class="margin-top-2" v-if="Array.isArray(game.ranking) && game.ranking.length">
                <li><span class="underline">Top 5 Teams</span></li>
                <li
                  v-for="(team, i) in (game.ranking || []).slice(0, 5)"
                  :key="`${game._id}-rank-${i}-${team.teamName}`"
                >
                  {{ team.teamName }} - {{ team.duration }}
                </li>
              </ul>
              <p v-else class="margin-top-2 muted">Noch keine Teams oder wird geladen…</p>

              <div class="game-actions">
                <router-link
                  :to="`/admin/game/${game.encryptedId}?from=admin`"
                  target="_blank"
                  class="link-button"
                  @click.stop
                >
                  Zum Spiel
                </router-link>
                <button @click.stop="editGame(game)"><font-awesome-icon icon="edit" title="bearbeiten" /></button>
                <button @click.stop="deleteGame(game._id)">
                  <font-awesome-icon icon="trash" title="löschen" />
                </button>
                <button
                  class="icon-btn"
                  title="Spiel kopieren"
                  @click.stop="copyGame(game._id)"
                >
                  📋
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Neues Spiel -->
      <GameForm v-if="currentView === 'new'" :game="newGame" @save="createGame" />

      <!-- Spiel bearbeiten -->
      <GameEditForm
        v-if="currentView === 'edit'"
        :game="selectedGame"
        @save="updateGame"
        @cancel="cancelEdit"
      />

      <!-- Bestellungen (lazy loaded component) -->
      <OrderList v-if="currentView === 'orders'" />

      <!-- Newsletter (lazy loaded component) -->
      <NewsletterAdmin v-if="currentView === 'newsletter'" />
    </section>
  </div>
</template>

<script>
import GameForm from "@/components/GameForm.vue";
import GameEditForm from "@/components/GameEditForm.vue";
// 👉 Code-Splitting (kleineres Initial-Bundle)
import { defineAsyncComponent } from 'vue';
const OrderList = defineAsyncComponent(() => import('@/components/OrderList.vue'));
const NewsletterAdmin = defineAsyncComponent(() => import('@/components/AdminNewsletter.vue'));

import { apiService } from "@/services/apiService";

export default {
  name: "AdminPage",
  components: { GameForm, GameEditForm, OrderList, NewsletterAdmin },
  data() {
    return {
      currentView: "list",
      games: [],
      newGame: { city: "", name: "", ageGroup: "" },
      selectedGame: null,
      expandedId: null,
    };
  },
  methods: {
    async fetchGames() {
      try {
        // nur schlanke Felder laden
        const games = await apiService.fetchAllGames({
          fields: '_id,name,city,ageGroup,encryptedId,isDisabled,questionsCount'
        });
        // Ranking erst bei Expand nachladen
        this.games = games.map(g => ({ ...g, ranking: null }));
        this.expandedId = null;
      } catch (error) {
        console.error("Fehler beim Laden der Spiele:", error);
      }
    },

    async toggleGame(game) {
      const willOpen = this.expandedId !== game._id;
      this.expandedId = willOpen ? game._id : null;

      // Lazy: Ranking nur beim Öffnen, nur einmal
      if (willOpen && game.ranking == null) {
        try {
          // Optional: Einzelabruf
          // game.ranking = await apiService.fetchRanking(game.encryptedId);

          // Besser: Batch für alle sichtbaren Spiele,
          // hier einfachheitshalber: alle in der Liste
          const ids = this.games
            .filter(g => g.ranking == null) // nur die, die noch nichts haben
            .map(g => g.encryptedId);

          const map = await apiService.fetchRankingsBatch(ids);
          this.games = this.games.map(g => ({
            ...g,
            ranking: g.ranking ?? (map[g.encryptedId] || [])
          }));
        } catch (e) {
          console.error('Ranking konnte nicht geladen werden:', e);
          game.ranking = [];
        }
      }
    },

    // Height-Transition Hooks
    onEnter(el) {
      el.style.transition = "none";
      el.style.overflow = "hidden";
      el.style.height = "0px";
      el.style.opacity = "0";
      const origPT = getComputedStyle(el).paddingTop;
      const origPB = getComputedStyle(el).paddingBottom;
      el.dataset.pt = origPT;
      el.dataset.pb = origPB;
      el.style.paddingTop = "0px";
      el.style.paddingBottom = "0px";

      requestAnimationFrame(() => {
        const target = el.scrollHeight;
        el.style.transition = "height 0.25s ease, opacity 0.2s ease, padding 0.2s ease";
        el.style.height = target + "px";
        el.style.opacity = "1";
        el.style.paddingTop = el.dataset.pt || "10px";
        el.style.paddingBottom = el.dataset.pb || "14px";
      });
    },
    onAfterEnter(el) {
      el.style.height = "";
      el.style.opacity = "";
      el.style.paddingTop = "";
      el.style.paddingBottom = "";
      el.style.overflow = "";
      el.style.transition = "";
      delete el.dataset.pt;
      delete el.dataset.pb;
    },
    onLeave(el) {
      el.style.overflow = "hidden";
      const start = el.scrollHeight;
      el.style.height = start + "px";
      el.style.opacity = "1";
      const origPT = getComputedStyle(el).paddingTop;
      const origPB = getComputedStyle(el).paddingBottom;

      requestAnimationFrame(() => {
        el.style.transition = "height 0.25s ease, opacity 0.2s ease, padding 0.2s ease";
        el.style.height = "0px";
        el.style.opacity = "0";
        el.style.paddingTop = "0px";
        el.style.paddingBottom = "0px";
      });

      el.addEventListener(
        "transitionend",
        () => {
          el.style.height = "";
          el.style.opacity = "";
          el.style.paddingTop = origPT;
          el.style.paddingBottom = origPB;
          el.style.overflow = "";
          el.style.transition = "";
        },
        { once: true }
      );
    },

    async createGame(game) {
      try {
        await apiService.createGame({ ...game });
        await this.fetchGames();
        this.currentView = "list";
        this.$root?.showToast?.("Daten wurden erfolgreich gespeichert!");
      } catch (err) {
        this.$root?.showToast?.("Fehler beim Erstellen des Spiels!!");
        console.error("Fehler beim Erstellen des Spiels:", err);
      }
    },
    async copyGame(gameId) {
      try {
        await apiService.copyGame(gameId);
        this.$root?.showToast?.("Spiel wurde erfolgreich kopiert!");
        await this.fetchGames();
      } catch (error) {
        console.error("Fehler beim Kopieren des Spiels:", error);
        this.$root?.showToast?.("Fehler beim Kopieren des Spiels!");
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
      await this.fetchGames();
      this.currentView = "list";
    },
    async deleteGame(game_id) {
      if (!game_id) {
        console.error("Fehler: game_id ist undefined");
        return;
      }
      await apiService.deleteGame(game_id);
      await this.fetchGames();
      this.$root?.showToast?.("Spiel wurde erfolgreich gelöscht!");
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

<style scoped>
.admin-container { display: flex; flex-direction: column; gap: 16px; padding: 0 10px; }
.logout { display: flex; align-items: center; justify-content: space-between; }
.topbar { display: flex; justify-content: flex-end; }
.topbar button { background:#f7f7f7; border:1px solid #ccc; border-radius:6px; padding:6px 12px; cursor:pointer; transition: background .2s, border-color .2s; margin:0 5px; }
.topbar button:hover { background:#eee; }
.topbar button.active { background:#355b4c; border-color:#355b4c; color:#fff; font-weight:600; }

.game-list { display:flex; flex-wrap:wrap; gap:16px; align-items:flex-start; }
.game-card { flex:1 1 calc(33.333% - 16px); min-width:280px; align-self:flex-start; border:1px solid #e3e3e3; border-radius:10px; background:#fff; }
@media (max-width:1100px){ .game-card{ flex:1 1 calc(50% - 16px); } }
@media (max-width:700px){ .game-card{ flex:1 1 100%; } }

.enabled-border { border-color:#b6dfb6; }
.disabled-border { border-color:#f1bebe; }
.game-card-header { display:flex; justify-content:space-between; align-items:center; padding:10px 12px; cursor:pointer; user-select:none; }
.game-card-title { margin:0; font-size:1.05rem; line-height:1.2; }
.game-card-header-actions { display:flex; align-items:center; gap:8px; }
.icon-btn { border:none; background:transparent; cursor:pointer; font-size:1.4rem; padding:0!important; }
.toggle-icon { font-weight:700; font-size:1.1rem; width:1.5rem; text-align:center; }
.game-card-body { width:100%; padding:10px 12px 14px; border-top:1px solid #eee; }
.grid--info { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:6px 12px; }
.mt-1{ margin-top:8px; } .margin-top-2{ margin-top:12px; }
.muted{ color:#666; }
.game-actions { display:flex; gap:8px; align-items:center; margin-top:12px; }
.link-button, .button, .btn { display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:8px; text-decoration:none; border:1px solid #ddd; }
.btn--logout { background:#fafafa; }
</style>
